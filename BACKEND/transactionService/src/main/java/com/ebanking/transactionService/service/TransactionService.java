package com.ebanking.transactionService.service;

import com.ebanking.transactionService.dto.FaceAuthCheckResponse;
import com.ebanking.transactionService.entity.Account;
import com.ebanking.transactionService.entity.Transaction;
import com.ebanking.transactionService.entity.TransactionLimit;
import com.ebanking.transactionService.enums.KafkaTopic;
import com.ebanking.transactionService.enums.TransactionStatus;
import com.ebanking.transactionService.enums.TransactionType;
import com.ebanking.transactionService.grpc.TransactionProto;

import com.ebanking.transactionService.mappers.TransactionMapper;
import com.ebanking.transactionService.repository.AccountRepository;
import com.ebanking.transactionService.repository.TransactionLimitRepository;
import com.ebanking.transactionService.repository.TransactionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import com.ebanking.transactionService.exception.TransactionException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
public class TransactionService {

    private final KafkaTemplate<String, Transaction> kafkaTemplate;
    private final KafkaTemplate<String, String> stringKafkaTemplate;

    @Autowired
    public TransactionService(
            KafkaTemplate<String, Transaction> kafkaTemplate,
            KafkaTemplate<String, String> stringKafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
        this.stringKafkaTemplate = stringKafkaTemplate;
    }

    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    AccountRepository accountRepository;

    @Autowired
    TransactionMapper transactionMapper;

    @Autowired
    TransactionLimitRepository limitRepository;

    @Autowired
    private TransactionLimitService limitService;

    @Autowired
    private RedisTemplate<String, String> redisTemplateForString;

    private static final BigDecimal SINGLE_LIMIT = new BigDecimal("10000000");
    private static final BigDecimal DAILY_LIMIT = new BigDecimal("50000000");

    /**
     * Check if face authentication is required for this transaction
     *
     * @param userId   User ID
     * @param username Username
     * @param amount   Transaction amount
     * @return FaceAuthCheckResponse with required flag and reason
     */
    public FaceAuthCheckResponse checkFaceAuthRequired(Long userId, String username, BigDecimal amount) {
        log.info("Checking face auth requirement for user: {}, amount: {}", username, amount);

        // Generate session ID for tracking
        String sessionId = UUID.randomUUID().toString();

        // Get user's custom limits using centralized service
        LocalDate today = LocalDate.now();
        TransactionLimit userLimit = limitService.getOrCreateLimit(userId, today);

        BigDecimal userSingleLimit = userLimit.getSingleTransactionLimit();
        BigDecimal userDailyLimit = userLimit.getDailyLimit();

        // Check 1: Single transaction exceeds user's single limit
        if (amount.compareTo(userSingleLimit) > 0) {
            log.info("Face auth required: HIGH_AMOUNT (amount: {} > user limit: {})", amount, userSingleLimit);
            return FaceAuthCheckResponse.builder()
                    .required(true)
                    .reason("HIGH_AMOUNT")
                    .message("Giao dịch vượt hạn mức cho phép (" + formatMoney(userSingleLimit) + " VNĐ)")
                    .sessionId(sessionId)
                    .limit(formatMoney(userSingleLimit))
                    .build();
        }

        // Check 2: Daily limit
        BigDecimal todayTotal = limitRepository.getTodayTotalAmount(username, today);

        log.info("Today's total for user {}: {}, daily limit: {}", username, todayTotal, userDailyLimit);

        if (todayTotal.add(amount).compareTo(userDailyLimit) > 0) {
            log.info("Face auth required: DAILY_LIMIT (today: {} + amount: {} > limit: {})",
                    todayTotal, amount, userDailyLimit);
            return FaceAuthCheckResponse.builder()
                    .required(true)
                    .reason("DAILY_LIMIT")
                    .message("Vượt hạn mức giao dịch trong ngày (" + formatMoney(userDailyLimit) + " VNĐ)")
                    .sessionId(sessionId)
                    .limit(formatMoney(userDailyLimit))
                    .build();
        }

        log.info("Face auth not required for user: {}", username);
        return FaceAuthCheckResponse.builder()
                .required(false)
                .reason(null)
                .message(null)
                .sessionId(null)
                .build();
    }

    private String formatMoney(BigDecimal amount) {
        return String.format("%,.0f", amount);
    }

    /**
     *
     * @param data
     * @return
     */
    @Transactional
    public TransactionProto.TransferResponse transfer(TransactionProto.TransferRequest data)
            throws TransactionException {

        if (data.getSenderAccountNumber().equals(data.getReceiverAccountNumber())) {
            throw new TransactionException("error_dont_send_yourself");
        }
        Account sender = accountRepository.findByAccountNumber(data.getSenderAccountNumber()).get();
        if (sender == null)
            throw new TransactionException("Tài khoản không hợp lệ");
        BigDecimal amount = new BigDecimal(data.getAmount());
        if (sender.getBalance().compareTo(amount) < 0) {
            throw new TransactionException("error_amount_not_enough");
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new TransactionException("error_not_valid");
        }

        // Face authentication check
        boolean requiresFaceAuth = data.getRequiresFaceAuth();
        String faceAuthSessionId = data.getFaceAuthSessionId();

        if (requiresFaceAuth && (faceAuthSessionId == null || faceAuthSessionId.isEmpty())) {
            log.error("Face auth required but session ID missing");
            throw new TransactionException("FACE_AUTH_REQUIRED");
        }

        // Verify face auth if required
        Boolean faceAuthVerified = false;
        LocalDateTime faceAuthAt = null;

        if (requiresFaceAuth && faceAuthSessionId != null) {
            // Verify face auth session from Redis
            String redisKey = "face_auth_session:" + faceAuthSessionId;
            String sessionValue = redisTemplateForString.opsForValue().get(redisKey);

            if (!"verified".equals(sessionValue)) {
                log.error("Face auth session not found or expired: {}", faceAuthSessionId);
                throw new TransactionException("FACE_AUTH_SESSION_INVALID");
            }

            // Delete session after verification (one-time use)
            redisTemplateForString.delete(redisKey);
            log.info("::: Face auth session verified and deleted: {}", faceAuthSessionId);

            faceAuthVerified = true;
            faceAuthAt = LocalDateTime.now();
        }

        Transaction transaction = transactionRepository.save(Transaction.builder()
                .senderAccountNumber(data.getSenderAccountNumber())
                .receiverAccountNumber(data.getReceiverAccountNumber())
                .amount(amount)
                .currency(data.getCurrency())
                .transactionType(TransactionType.fromName(data.getTransactionType()).name())
                .status(TransactionStatus.PENDING.name())
                .description(data.getDescription())
                .transactionAt(LocalDateTime.now())
                .username(data.getUsername())
                .requiresFaceAuth(requiresFaceAuth)
                .faceAuthSessionId(faceAuthSessionId)
                .faceAuthVerified(faceAuthVerified)
                .faceAuthAt(faceAuthAt)
                .build());
        kafkaTemplate.send(KafkaTopic.TRANSACTION_PROCESSER.getTopicName(), transaction);
        return transactionMapper.toTransferRequestProto(transaction);
    }

    /**
     *
     * @param transaction
     * @return
     * @throws TransactionException
     */
    @Transactional
    public TransactionProto.TransferResponse processTransfer(Transaction transaction)
            throws TransactionException, JsonProcessingException {

        if (transaction.getSenderAccountNumber().equals(transaction.getReceiverAccountNumber())) {
            transaction.setStatus(TransactionStatus.FAILED.name());
            transaction.setFailureReason("Tai khoản người nhận trùng với người gửi");
            kafkaTemplate.send(KafkaTopic.TRANSACTION_NOTIFY.getTopicName(), transaction);
            throw new TransactionException("error_dont_send_yourself");
        }
        Account sender = accountRepository.findByAccountNumber(transaction.getSenderAccountNumber()).get();
        Account receiver = accountRepository.findByAccountNumber(transaction.getReceiverAccountNumber()).get();
        if (sender == null || receiver == null) {
            transaction.setStatus(TransactionStatus.FAILED.name());
            transaction.setFailureReason("Thông tin không hợp lệ");
            // publish failed transaction event
            kafkaTemplate.send(KafkaTopic.TRANSACTION_NOTIFY.getTopicName(), transaction);
            throw new TransactionException("error_info_not_true");
        }
        BigDecimal amount = new BigDecimal(String.valueOf(transaction.getAmount()));
        if (sender.getBalance().compareTo(amount) < 0) {
            transaction.setStatus(TransactionStatus.FAILED.name());
            transaction.setFailureReason("Số dư không đủ");
            // publish failed transaction event
            kafkaTemplate.send(KafkaTopic.TRANSACTION_NOTIFY.getTopicName(), transaction);
            throw new TransactionException("error_amount_not_enough");
        }
        sender.setBalance(sender.getBalance().subtract(amount));
        receiver.setBalance(receiver.getBalance().add(amount));

        accountRepository.save(sender);
        accountRepository.save(receiver);
        transaction.setStatus(TransactionStatus.SUCCESS.name());

        // Delegate to TransactionLimitService for used_amount update
        limitService.incrementUsedAmount(sender.getUserId(), amount);

        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        String socketMessage = mapper.writeValueAsString(transaction);
        stringKafkaTemplate.send(KafkaTopic.TRANSFER_NOTIFY_REALTIME.getTopicName(), socketMessage);

        // publish success transaction event for notifications
        kafkaTemplate.send(KafkaTopic.TRANSACTION_NOTIFY.getTopicName(), transaction);
        // send email notification
        kafkaTemplate.send(KafkaTopic.TRANSFER_SEND_EMAIL.getTopicName(), transaction);

        return transactionMapper.toTransferResponse(transactionRepository.save(transaction));
    }

    /**
     * @param fromDate
     * @param toDate
     * @param page
     * @param size
     * @return
     */
    public Page<Transaction> getTransactionHistory(String search,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            int page,
            int size) {

        log.info("🔍 getTransactionHistory called - search: '{}', fromDate: {}, toDate: {}, page: {}, size: {}", 
                 search, fromDate, toDate, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("transactionAt").descending());

        // Account numbers are typically 10-12 digits, transaction IDs are 1-9 digits
        if (search != null && search.matches("\\d+") && search.length() < 10) {
            log.info("🔍 Search '{}' is numeric and < 10 digits, trying transaction ID lookup", search);
            try {
                Long txId = Long.parseLong(search);
                var opt = transactionRepository.findById(txId);
                if (opt.isPresent()) {
                    log.info("✅ Found transaction by ID: {}", txId);
                    Transaction tx = opt.get();
                    boolean inRange = (fromDate == null || !tx.getTransactionAt().isBefore(fromDate))
                            && (toDate == null || !tx.getTransactionAt().isAfter(toDate));
                    var content = inRange ? List.of(tx) : List.<Transaction>of();
                    log.info("✅ Returning {} transaction(s) by ID", content.size());
                    return new PageImpl<>(content, pageable, content.size());
                } else {
                    log.info("⚠️ Transaction ID {} not found, falling through to account number search", txId);
                }
            } catch (NumberFormatException e) {
                log.warn("⚠️ Failed to parse '{}' as Long, falling through to account number search", search);
            }
        } else {
            log.info("🔍 Search '{}' is {} digits, using account number search", 
                     search, search != null ? search.length() : 0);
        }

        log.info("🔍 Searching by account number: '{}'", search);
        Page<Transaction> result = transactionRepository.findByAccountNumberAndDateRange(
                search,
                fromDate,
                toDate,
                pageable);
        log.info("✅ Account number search returned {} transaction(s)", result.getTotalElements());
        return result;
    }

    public Account getAccountInfoFromAccountNumber(String accountNumber) {
        return accountRepository.findByAccountNumber(accountNumber).get();
    }
}
