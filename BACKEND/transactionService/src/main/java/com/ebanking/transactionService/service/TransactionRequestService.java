package com.ebanking.transactionService.service;

import com.ebanking.transactionService.dto.*;
import com.ebanking.transactionService.entity.*;
import com.ebanking.transactionService.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionRequestService {

    private final TransactionRequestRepository transactionRequestRepository;
    private final SavingsAccountRepository savingsAccountRepository;

    @Transactional
    public TransactionRequestDto createCashTransactionRequest(CashTransactionRequest request) {
        log.info("Creating cash transaction request for user: {}, type: {}", 
                request.getUserId(), request.getRequestType());

        // Validate savings account
        SavingsAccount savingsAccount = savingsAccountRepository.findById(request.getSavingsAccountId())
                .orElseThrow(() -> new RuntimeException("Savings account not found"));

        if (!savingsAccount.getUserId().equals(request.getUserId())) {
            throw new RuntimeException("Savings account does not belong to user");
        }

        if (!"ACTIVE".equals(savingsAccount.getStatus())) {
            throw new RuntimeException("Savings account is not active");
        }

        // For withdrawal, check if sufficient balance
        if ("CASH_WITHDRAWAL".equals(request.getRequestType())) {
            if (savingsAccount.getBalance().compareTo(request.getAmount()) < 0) {
                throw new RuntimeException("Insufficient balance in savings account");
            }
        }

        // Generate unique request number
        String requestNumber = generateRequestNumber();

        // Create transaction request
        TransactionRequest transactionRequest = TransactionRequest.builder()
                .requestNumber(requestNumber)
                .userId(request.getUserId())
                .savingsAccountId(request.getSavingsAccountId())
                .requestType(request.getRequestType())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .status("PENDING")
                .description(request.getDescription())
                .build();

        transactionRequest = transactionRequestRepository.save(transactionRequest);

        log.info("Cash transaction request created: {}", requestNumber);
        return convertToDto(transactionRequest, savingsAccount.getAccountNumber());
    }

    public List<TransactionRequestDto> getUserTransactionRequests(Long userId) {
        List<TransactionRequest> requests = transactionRequestRepository.findByUserId(userId);
        return requests.stream()
                .map(request -> {
                    SavingsAccount savingsAccount = savingsAccountRepository.findById(request.getSavingsAccountId()).orElse(null);
                    String accountNumber = savingsAccount != null ? savingsAccount.getAccountNumber() : null;
                    return convertToDto(request, accountNumber);
                })
                .collect(Collectors.toList());
    }

    public List<TransactionRequestDto> getPendingRequests() {
        List<TransactionRequest> requests = transactionRequestRepository.findPendingRequests();
        return requests.stream()
                .map(request -> {
                    SavingsAccount savingsAccount = savingsAccountRepository.findById(request.getSavingsAccountId()).orElse(null);
                    String accountNumber = savingsAccount != null ? savingsAccount.getAccountNumber() : null;
                    return convertToDto(request, accountNumber);
                })
                .collect(Collectors.toList());
    }

    public Optional<TransactionRequestDto> getRequestByNumber(String requestNumber) {
        return transactionRequestRepository.findByRequestNumber(requestNumber)
                .map(request -> {
                    SavingsAccount savingsAccount = savingsAccountRepository.findById(request.getSavingsAccountId()).orElse(null);
                    String accountNumber = savingsAccount != null ? savingsAccount.getAccountNumber() : null;
                    return convertToDto(request, accountNumber);
                });
    }

    @Transactional
    public TransactionRequestDto approveRequest(Long requestId, String adminUsername) {
        log.info("Approving transaction request: {} by admin: {}", requestId, adminUsername);

        TransactionRequest request = transactionRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Transaction request not found"));

        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Request is not in pending status");
        }

        SavingsAccount savingsAccount = savingsAccountRepository.findById(request.getSavingsAccountId())
                .orElseThrow(() -> new RuntimeException("Savings account not found"));

        // Process the request based on type
        if ("CASH_DEPOSIT".equals(request.getRequestType())) {
            savingsAccount.setBalance(savingsAccount.getBalance().add(request.getAmount()));
        } else if ("CASH_WITHDRAWAL".equals(request.getRequestType())) {
            if (savingsAccount.getBalance().compareTo(request.getAmount()) < 0) {
                throw new RuntimeException("Insufficient balance in savings account");
            }
            savingsAccount.setBalance(savingsAccount.getBalance().subtract(request.getAmount()));
        }

        savingsAccountRepository.save(savingsAccount);

        // Update request status
        request.setStatus("COMPLETED");
        request.setProcessedAt(LocalDateTime.now());
        request.setProcessedBy(adminUsername);
        request = transactionRequestRepository.save(request);

        log.info("Transaction request approved and completed: {}", request.getRequestNumber());
        return convertToDto(request, savingsAccount.getAccountNumber());
    }

    @Transactional
    public TransactionRequestDto rejectRequest(Long requestId, String adminUsername, String rejectionReason) {
        log.info("Rejecting transaction request: {} by admin: {}", requestId, adminUsername);

        TransactionRequest request = transactionRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Transaction request not found"));

        if (!"PENDING".equals(request.getStatus())) {
            throw new RuntimeException("Request is not in pending status");
        }

        request.setStatus("REJECTED");
        request.setRejectionReason(rejectionReason);
        request.setProcessedAt(LocalDateTime.now());
        request.setProcessedBy(adminUsername);
        request = transactionRequestRepository.save(request);

        SavingsAccount savingsAccount = savingsAccountRepository.findById(request.getSavingsAccountId()).orElse(null);
        String accountNumber = savingsAccount != null ? savingsAccount.getAccountNumber() : null;

        log.info("Transaction request rejected: {}", request.getRequestNumber());
        return convertToDto(request, accountNumber);
    }

    private String generateRequestNumber() {
        String prefix = "REQ";
        String suffix;
        String requestNumber;
        
        do {
            suffix = String.valueOf(System.currentTimeMillis() % 1000000000L);
            requestNumber = prefix + suffix;
        } while (transactionRequestRepository.existsByRequestNumber(requestNumber));
        
        return requestNumber;
    }

    private TransactionRequestDto convertToDto(TransactionRequest request, String savingsAccountNumber) {
        return TransactionRequestDto.builder()
                .requestId(request.getRequestId())
                .requestNumber(request.getRequestNumber())
                .userId(request.getUserId())
                .savingsAccountId(request.getSavingsAccountId())
                .savingsAccountNumber(savingsAccountNumber)
                .requestType(request.getRequestType())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .status(request.getStatus())
                .description(request.getDescription())
                .rejectionReason(request.getRejectionReason())
                .requestedAt(request.getRequestedAt())
                .processedAt(request.getProcessedAt())
                .processedBy(request.getProcessedBy())
                .build();
    }
}