package com.ebanking.transactionService.service;
import com.ebanking.transactionService.entity.Account;
import com.ebanking.transactionService.entity.Transaction;
import com.ebanking.transactionService.enums.KafkaTopic;
import com.ebanking.transactionService.enums.TransactionStatus;
import com.ebanking.transactionService.enums.TransactionType;
import com.ebanking.transactionService.grpc.TransactionProto;

import com.ebanking.transactionService.mappers.TransactionMapper;
import com.ebanking.transactionService.repository.AccountRepository;
import com.ebanking.transactionService.repository.TransactionRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import com.ebanking.transactionService.exception.TransactionException;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class TransactionService {

    private final KafkaTemplate<String, Transaction> kafkaTemplate;
    private final KafkaTemplate<String, String> stringKafkaTemplate;

    @Autowired
    public TransactionService(
            KafkaTemplate<String, Transaction> kafkaTemplate,
            KafkaTemplate<String, String> stringKafkaTemplate
    ) {
        this.kafkaTemplate = kafkaTemplate;
        this.stringKafkaTemplate = stringKafkaTemplate;
    }

    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    AccountRepository accountRepository;

    @Autowired
    TransactionMapper transactionMapper;

    /**
     *
     * @param data
     * @return
     */
    @Transactional
    public TransactionProto.TransferResponse transfer(TransactionProto.TransferRequest data) throws TransactionException {

        if (data.getSenderAccountNumber().equals(data.getReceiverAccountNumber())) {
            throw new TransactionException("error_dont_send_yourself");
        }
        Account sender = accountRepository.findByAccountNumber(data.getSenderAccountNumber());
        if (sender == null) throw new TransactionException("Tài khoản không hợp lệ");
        BigDecimal amount = new BigDecimal(data.getAmount());
        if (sender.getBalance().compareTo(amount) < 0) {
            throw new TransactionException("error_amount_not_enough");
        }
        if (amount.compareTo(BigDecimal.ZERO) < 0) {
            throw new TransactionException("error_not_valid");
        }
        Transaction transaction =
        transactionRepository.save(Transaction.builder()
                .senderAccountNumber(data.getSenderAccountNumber())
                .receiverAccountNumber(data.getReceiverAccountNumber())
                .amount(amount)
                .currency(data.getCurrency())
                .transactionType(TransactionType.fromName(data.getTransactionType()).name())
                .status(TransactionStatus.PENDING.name())
                .description(data.getDescription())
                .transactionAt(LocalDateTime.now())
                .username(data.getUsername())
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
    public TransactionProto.TransferResponse processTransfer(Transaction transaction) throws TransactionException, JsonProcessingException {

        if (transaction.getSenderAccountNumber().equals(transaction.getReceiverAccountNumber())) {
            transaction.setStatus(TransactionStatus.FAILED.name());
            transaction.setFailureReason("Tai khoản người nhận trùng với người gửi");
            kafkaTemplate.send(KafkaTopic.TRANSACTION_NOTIFY.getTopicName(), transaction);
            throw new TransactionException("error_dont_send_yourself");
        }
        Account sender = accountRepository.findByAccountNumber(transaction.getSenderAccountNumber());
        Account receiver = accountRepository.findByAccountNumber(transaction.getReceiverAccountNumber());
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
     *
     * @param username
     * @param sender
     * @param fromDate
     * @param toDate
     * @param page
     * @param size
     * @return
     */
    public Page<Transaction> getTransactionHistory(String username,
                                                   String sender,
                                                   LocalDateTime fromDate,
                                                   LocalDateTime toDate,
                                                   int page,
                                                   int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("transactionAt").descending());

        return transactionRepository.findByUsernameAndSenderAndDateRange(
                username,
                sender,
                fromDate,
                toDate,
                pageable
        );
    }
}
