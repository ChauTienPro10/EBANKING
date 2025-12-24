package com.ebanking.transactionService.service;

import com.ebanking.transactionService.dto.DataTopUpRequest;
import com.ebanking.transactionService.dto.DataTopUpResponse;
import com.ebanking.transactionService.entity.DataPackage;
import com.ebanking.transactionService.entity.DataTopUp;
import com.ebanking.transactionService.entity.Account;
import com.ebanking.transactionService.exception.TransactionException;
import com.ebanking.transactionService.repository.DataPackageRepository;
import com.ebanking.transactionService.repository.DataTopUpRepository;
import com.ebanking.transactionService.repository.AccountRepository;
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
@Transactional
public class DataTopUpService {

    private final DataTopUpRepository dataTopUpRepository;
    private final DataPackageRepository dataPackageRepository;
    private final AccountRepository accountRepository;
    private final TelecomProviderService telecomProviderService;

    public DataTopUpResponse initiateDataTopUp(DataTopUpRequest request, Long userId, String username) throws TransactionException {
        log.info("Initiating data top-up for user: {} to phone: {}", userId, request.getPhoneNumber());

        // Validate data package
        DataPackage dataPackage = dataPackageRepository.findById(request.getPackageId())
                .filter(pkg -> pkg.getIsActive())
                .orElseThrow(() -> new TransactionException("Data package not found or inactive"));

        // Validate account
        Account account = accountRepository.findByAccountNumber(request.getAccountNumber())
                .orElseThrow(() -> new TransactionException("Account not found"));

        if (!account.getUserId().equals(userId)) {
            throw new TransactionException("Account does not belong to user");
        }

        // Check account balance
        if (account.getBalance().compareTo(dataPackage.getPrice()) < 0) {
            throw new TransactionException("Insufficient balance");
        }

//        // Detect telecom provider from phone number
//        String providerCode = detectTelecomProvider(request.getPhoneNumber());
//
//        // Validate provider matches package provider
//        if (!dataPackage.getProvider().getProviderCode().equals(providerCode)) {
//            throw new TransactionException("Phone number provider does not match selected package provider");
//        }

        // Create data top-up transaction
        DataTopUp dataTopUp = DataTopUp.builder()
                .transactionId(generateTransactionId())
                .userId(userId)
                .username(username)
                .accountNumber(request.getAccountNumber())
                .phoneNumber(request.getPhoneNumber())
                .packageId(request.getPackageId())
                .telecomProvider(dataPackage.getProvider().getProviderName())
                .packageName(dataPackage.getPackageName())
                .dataAmount(dataPackage.getDataAmount())
                .validityDays(dataPackage.getValidityDays())
                .amount(dataPackage.getPrice())
                .currency("VND")
                .status("PENDING")
                .requiresFaceAuth(request.getRequiresFaceAuth())
                .faceAuthSessionId(request.getFaceAuthSessionId())
                .build();

        dataTopUp = dataTopUpRepository.save(dataTopUp);
        log.info("Created data top-up transaction: {}", dataTopUp.getTransactionId());

        // If face authentication is required, return pending response
        if (Boolean.TRUE.equals(request.getRequiresFaceAuth())) {
            return convertToResponse(dataTopUp);
        }

        // Process the top-up immediately
        return processDataTopUp(dataTopUp);
    }

    public DataTopUpResponse processDataTopUp(DataTopUp dataTopUp) {
        log.info("Processing data top-up: {}", dataTopUp.getTransactionId());

        try {
            dataTopUp.setStatus("PROCESSING");
            dataTopUp = dataTopUpRepository.save(dataTopUp);

            // Deduct amount from account
            Account account = accountRepository.findByAccountNumber(dataTopUp.getAccountNumber())
                    .orElseThrow(() -> new TransactionException("Account not found"));

            if (account.getBalance().compareTo(dataTopUp.getAmount()) < 0) {
                throw new TransactionException("Insufficient balance");
            }

            account.setBalance(account.getBalance().subtract(dataTopUp.getAmount()));
            accountRepository.save(account);

            // Call telecom provider API (simulated)
            String providerTransactionId = callTelecomProviderAPI(dataTopUp);
            
            dataTopUp.setProviderTransactionId(providerTransactionId);
            dataTopUp.setStatus("COMPLETED");
            dataTopUp.setProviderResponse("Data package activated successfully");
            
            dataTopUp = dataTopUpRepository.save(dataTopUp);
            log.info("Data top-up completed successfully: {}", dataTopUp.getTransactionId());

        } catch (Exception e) {
            log.error("Data top-up failed: {}", dataTopUp.getTransactionId(), e);
            dataTopUp.setStatus("FAILED");
            dataTopUp.setFailureReason(e.getMessage());
            dataTopUp = dataTopUpRepository.save(dataTopUp);
            
            // Refund if amount was deducted
            if ("PROCESSING".equals(dataTopUp.getStatus())) {
                refundAmount(dataTopUp);
            }
        }

        return convertToResponse(dataTopUp);
    }

    public DataTopUpResponse verifyFaceAuthAndProcess(String transactionId, String faceAuthSessionId) throws TransactionException {
        log.info("Verifying face auth for data top-up: {}", transactionId);

        DataTopUp dataTopUp = dataTopUpRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new TransactionException("Data top-up transaction not found"));

        if (!faceAuthSessionId.equals(dataTopUp.getFaceAuthSessionId())) {
            throw new TransactionException("Invalid face authentication session");
        }

        dataTopUp.setFaceAuthVerified(true);
        dataTopUp.setFaceAuthAt(LocalDateTime.now());
        dataTopUp = dataTopUpRepository.save(dataTopUp);

        return processDataTopUp(dataTopUp);
    }

    public Optional<DataTopUpResponse> getDataTopUpByTransactionId(String transactionId) {
        return dataTopUpRepository.findByTransactionId(transactionId)
                .map(this::convertToResponse);
    }

    public List<DataTopUpResponse> getDataTopUpHistory(Long userId) {
        List<DataTopUp> topUps = dataTopUpRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return topUps.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    public Page<DataTopUpResponse> getDataTopUpHistory(Long userId, Pageable pageable) {
        Page<DataTopUp> topUps = dataTopUpRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return topUps.map(this::convertToResponse);
    }

    private String generateTransactionId() {
        return "DATA_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

//    private String detectTelecomProvider(String phoneNumber) throws TransactionException {
//        // Remove country code and leading zeros
//        String normalizedPhone = phoneNumber.replaceAll("^(\\+84|84|0)", "");
//
//        if (normalizedPhone.startsWith("3") || normalizedPhone.startsWith("8") || normalizedPhone.startsWith("9")) {
//            return "VIETTEL";
//        } else if (normalizedPhone.startsWith("5") || normalizedPhone.startsWith("7")) {
//            return "VINAPHONE";
//        } else if (normalizedPhone.startsWith("9")) {
//            return "MOBIFONE";
//        }
//
//        throw new TransactionException("Unable to detect telecom provider for phone number: " + phoneNumber);
//    }

    private String callTelecomProviderAPI(DataTopUp dataTopUp) {
        // Simulate API call to telecom provider
        log.info("Calling telecom provider API for data top-up: {}", dataTopUp.getTransactionId());
        
        // In real implementation, this would call the actual provider API
        // For now, simulate success
        return "PROVIDER_" + System.currentTimeMillis();
    }

    private void refundAmount(DataTopUp dataTopUp) {
        try {
            Account account = accountRepository.findByAccountNumber(dataTopUp.getAccountNumber())
                    .orElse(null);
            if (account != null) {
                account.setBalance(account.getBalance().add(dataTopUp.getAmount()));
                accountRepository.save(account);
                log.info("Refunded amount for failed data top-up: {}", dataTopUp.getTransactionId());
            }
        } catch (Exception e) {
            log.error("Failed to refund amount for data top-up: {}", dataTopUp.getTransactionId(), e);
        }
    }

    private DataTopUpResponse convertToResponse(DataTopUp dataTopUp) {
        return DataTopUpResponse.builder()
                .dataTopUpId(dataTopUp.getDataTopUpId())
                .transactionId(dataTopUp.getTransactionId())
                .phoneNumber(dataTopUp.getPhoneNumber())
                .telecomProvider(dataTopUp.getTelecomProvider())
                .packageName(dataTopUp.getPackageName())
                .formattedDataAmount(dataTopUp.getFormattedDataAmount())
                .validityDays(dataTopUp.getValidityDays())
                .amount(dataTopUp.getAmount())
                .currency(dataTopUp.getCurrency())
                .status(dataTopUp.getStatus())
                .providerTransactionId(dataTopUp.getProviderTransactionId())
                .failureReason(dataTopUp.getFailureReason())
                .createdAt(dataTopUp.getCreatedAt())
                .completedAt(dataTopUp.getCompletedAt())
                .requiresFaceAuth(dataTopUp.getRequiresFaceAuth())
                .faceAuthSessionId(dataTopUp.getFaceAuthSessionId())
                .faceAuthVerified(dataTopUp.getFaceAuthVerified())
                .build();
    }
}