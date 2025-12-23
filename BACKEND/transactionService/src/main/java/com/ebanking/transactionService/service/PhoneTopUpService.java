package com.ebanking.transactionService.service;

import com.ebanking.transactionService.dto.*;
import com.ebanking.transactionService.entity.Account;
import com.ebanking.transactionService.entity.PhoneTopUp;
import com.ebanking.transactionService.entity.TelecomProvider;
import com.ebanking.transactionService.entity.Transaction;
import com.ebanking.transactionService.repository.AccountRepository;
import com.ebanking.transactionService.repository.PhoneTopUpRepository;
import com.ebanking.transactionService.repository.TelecomProviderRepository;
import com.ebanking.transactionService.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PhoneTopUpService {

    private final PhoneTopUpRepository phoneTopUpRepository;
    private final TelecomProviderRepository telecomProviderRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final TransactionService transactionService;
    private final TelecomProviderService telecomProviderService;

    /**
     * Process phone top-up request
     */
    @Transactional
    public PhoneTopUpResponse processTopUp(PhoneTopUpRequest request) {
        try {
            log.info("Processing phone top-up for user: {}, phone: {}, amount: {}", 
                    request.getUsername(), request.getPhoneNumber(), request.getAmount());

            // Validate request
            validateTopUpRequest(request);

            // Check account balance
            Account account = accountRepository.findByAccountNumber(request.getAccountNumber())
                    .orElseThrow(() -> new RuntimeException("Account not found: " + request.getAccountNumber()));

            if (account.getBalance().compareTo(request.getAmount()) < 0) {
                throw new RuntimeException("Insufficient balance");
            }

            // Get telecom provider
            TelecomProvider provider = telecomProviderRepository.findByProviderCode(request.getTelecomProvider())
                    .orElseThrow(() -> new RuntimeException("Telecom provider not found: " + request.getTelecomProvider()));

            if (!provider.getIsActive()) {
                throw new RuntimeException("Telecom provider is not active: " + request.getTelecomProvider());
            }

            // Validate amount range
            if (request.getAmount().compareTo(provider.getMinAmount()) < 0 || 
                request.getAmount().compareTo(provider.getMaxAmount()) > 0) {
                throw new RuntimeException(String.format("Amount must be between %s and %s", 
                        provider.getMinAmount(), provider.getMaxAmount()));
            }

            // Check if face authentication is required
            FaceAuthCheckResponse faceAuthCheck = transactionService.checkFaceAuthRequired(
                    request.getUserId(), request.getUsername(), request.getAmount());

            // Create phone top-up record
            PhoneTopUp topUp = PhoneTopUp.builder()
                    .transactionId(generateTransactionId())
                    .userId(request.getUserId())
                    .username(request.getUsername())
                    .accountNumber(request.getAccountNumber())
                    .phoneNumber(request.getPhoneNumber())
                    .telecomProvider(request.getTelecomProvider())
                    .amount(request.getAmount())
                    .currency("VND")
                    .status("PENDING")
                    .requiresFaceAuth(faceAuthCheck.getRequired())
                    .faceAuthSessionId(faceAuthCheck.getRequired() ? request.getFaceAuthSessionId() : null)
                    .faceAuthVerified(!faceAuthCheck.getRequired()) // If no face auth required, mark as verified
                    .build();

            topUp = phoneTopUpRepository.save(topUp);

            // If face auth is required and not verified, return pending status
            if (faceAuthCheck.getRequired() && (request.getFaceAuthSessionId() == null ||
                    !Boolean.TRUE.equals(request.getRequiresFaceAuth()))) {
                log.info("Face authentication required for top-up: {}", topUp.getTransactionId());
                return PhoneTopUpResponse.fromEntity(topUp);
            }

            // Process the top-up
            return processTopUpTransaction(topUp, provider);

        } catch (Exception e) {
            log.error("Error processing phone top-up: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to process phone top-up: " + e.getMessage());
        }
    }

    /**
     * Process the actual top-up transaction
     */
    @Transactional
    public PhoneTopUpResponse processTopUpTransaction(PhoneTopUp topUp, TelecomProvider provider) {
        try {
            // Update status to processing
            topUp.setStatus("PROCESSING");
            topUp = phoneTopUpRepository.save(topUp);

            // Deduct amount from account
            Account account = accountRepository.findByAccountNumber(topUp.getAccountNumber())
                    .orElseThrow(() -> new RuntimeException("Account not found"));

            BigDecimal totalAmount = calculateTotalAmount(topUp.getAmount(), provider);
            
            if (account.getBalance().compareTo(totalAmount) < 0) {
                topUp.setStatus("FAILED");
                topUp.setFailureReason("Insufficient balance");
                phoneTopUpRepository.save(topUp);
                throw new RuntimeException("Insufficient balance");
            }

            // Deduct balance
            account.setBalance(account.getBalance().subtract(totalAmount));
            account.setLastTransactionAt(LocalDateTime.now());
            accountRepository.save(account);

            // Create transaction record
            Transaction transaction = Transaction.builder()
                    .username(topUp.getUsername())
                    .senderAccountNumber(topUp.getAccountNumber())
                    .receiverAccountNumber("PHONE_TOPUP_" + topUp.getPhoneNumber())
                    .amount(totalAmount)
                    .currency("VND")
                    .transactionType("PHONE_TOPUP")
                    .status("COMPLETED")
                    .description(String.format("Phone top-up %s - %s", topUp.getPhoneNumber(), topUp.getTelecomProvider()))
                    .transactionAt(LocalDateTime.now())
                    .requiresFaceAuth(topUp.getRequiresFaceAuth())
                    .faceAuthSessionId(topUp.getFaceAuthSessionId())
                    .faceAuthVerified(topUp.getFaceAuthVerified())
                    .build();

            transactionRepository.save(transaction);

            // Call telecom provider API (simulated)
            String providerTransactionId = callTelecomProviderAPI(topUp, provider);

            // Update top-up status
            topUp.setStatus("COMPLETED");
            topUp.setProviderTransactionId(providerTransactionId);
            topUp.setProviderResponse("Success");
            topUp.setCompletedAt(LocalDateTime.now());
            topUp = phoneTopUpRepository.save(topUp);

            log.info("Phone top-up completed successfully: {}", topUp.getTransactionId());
            return PhoneTopUpResponse.fromEntity(topUp);

        } catch (Exception e) {
            log.error("Error processing top-up transaction: {}", e.getMessage(), e);
            
            // Update status to failed
            topUp.setStatus("FAILED");
            topUp.setFailureReason(e.getMessage());
            phoneTopUpRepository.save(topUp);
            
            throw new RuntimeException("Failed to process top-up: " + e.getMessage());
        }
    }

    /**
     * Get user's top-up history
     */
    public List<PhoneTopUpResponse> getUserTopUpHistory(Long userId) {
        List<PhoneTopUp> topUps = phoneTopUpRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return topUps.stream()
                .map(PhoneTopUpResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Get user's top-up history with pagination
     */
    public Page<PhoneTopUpResponse> getUserTopUpHistory(Long userId, Pageable pageable) {
        Page<PhoneTopUp> topUps = phoneTopUpRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return topUps.map(PhoneTopUpResponse::fromEntity);
    }

    /**
     * Get top-up by transaction ID
     */
    public Optional<PhoneTopUpResponse> getTopUpByTransactionId(String transactionId) {
        return phoneTopUpRepository.findByTransactionId(transactionId)
                .map(PhoneTopUpResponse::fromEntity);
    }

    /**
     * Verify face authentication for top-up
     */
    @Transactional
    public PhoneTopUpResponse verifyFaceAuth(String faceAuthSessionId) {
        PhoneTopUp topUp = phoneTopUpRepository.findByFaceAuthSessionId(faceAuthSessionId)
                .orElseThrow(() -> new RuntimeException("Top-up not found for face auth session: " + faceAuthSessionId));

        if (!"PENDING".equals(topUp.getStatus())) {
            throw new RuntimeException("Top-up is not in pending status");
        }

        // Mark face auth as verified
        topUp.setFaceAuthVerified(true);
        topUp.setFaceAuthAt(LocalDateTime.now());
        topUp = phoneTopUpRepository.save(topUp);

        // Get provider and process the transaction
        TelecomProvider provider = telecomProviderRepository.findByProviderCode(topUp.getTelecomProvider())
                .orElseThrow(() -> new RuntimeException("Telecom provider not found"));

        return processTopUpTransaction(topUp, provider);
    }

    /**
     * Validate top-up request
     */
    private void validateTopUpRequest(PhoneTopUpRequest request) {
        if (request.getUserId() == null) {
            throw new RuntimeException("User ID is required");
        }
        if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
            throw new RuntimeException("Username is required");
        }
        if (request.getAccountNumber() == null || request.getAccountNumber().trim().isEmpty()) {
            throw new RuntimeException("Account number is required");
        }
        if (request.getPhoneNumber() == null || request.getPhoneNumber().trim().isEmpty()) {
            throw new RuntimeException("Phone number is required");
        }
        if (request.getTelecomProvider() == null || request.getTelecomProvider().trim().isEmpty()) {
            throw new RuntimeException("Telecom provider is required");
        }
        if (request.getAmount() == null || request.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Amount must be greater than zero");
        }

        // Validate phone number format (Vietnamese phone numbers)
        if (!isValidVietnamesePhoneNumber(request.getPhoneNumber())) {
            throw new RuntimeException("Invalid Vietnamese phone number format");
        }
    }

    /**
     * Validate Vietnamese phone number
     */
    private boolean isValidVietnamesePhoneNumber(String phoneNumber) {
        // Remove all non-digit characters
        String cleanNumber = phoneNumber.replaceAll("[^0-9]", "");
        
        // Vietnamese phone number patterns
        return cleanNumber.matches("^(84|0)(3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])[0-9]{7}$");
    }

    /**
     * Calculate total amount including fees
     */
    private BigDecimal calculateTotalAmount(BigDecimal amount, TelecomProvider provider) {
        BigDecimal fee = provider.getFixedFee().add(
                amount.multiply(provider.getFeePercentage().divide(BigDecimal.valueOf(100))));
        return amount.add(fee);
    }

    /**
     * Generate unique transaction ID
     */
    private String generateTransactionId() {
        return "TOPUP_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    /**
     * Call telecom provider API (simulated)
     */
    private String callTelecomProviderAPI(PhoneTopUp topUp, TelecomProvider provider) {
        // This is a simulation - in real implementation, you would call the actual provider API
        log.info("Calling {} API for phone: {}, amount: {}", 
                provider.getProviderName(), topUp.getPhoneNumber(), topUp.getAmount());
        
        // Simulate API call delay
        try {
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // Return simulated provider transaction ID
        return provider.getProviderCode() + "_" + System.currentTimeMillis();
    }
}