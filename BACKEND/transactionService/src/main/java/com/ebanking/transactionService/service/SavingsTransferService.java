package com.ebanking.transactionService.service;

import com.ebanking.transactionService.dto.TransferRequest;
import com.ebanking.transactionService.entity.*;
import com.ebanking.transactionService.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class SavingsTransferService {

    private final SavingsAccountRepository savingsAccountRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public void transferFromPaymentToSavings(TransferRequest request) {
        log.info("Transfer from payment to savings: {} -> {}", 
                request.getFromAccountNumber(), request.getToAccountNumber());

        // Validate accounts
        Account paymentAccount = accountRepository.findByAccountNumber(request.getFromAccountNumber())
                .orElseThrow(() -> new RuntimeException("Payment account not found"));

        SavingsAccount savingsAccount = savingsAccountRepository.findByAccountNumber(request.getToAccountNumber())
                .orElseThrow(() -> new RuntimeException("Savings account not found"));

        // Validate ownership
        if (!paymentAccount.getUserId().equals(request.getUserId()) ||
            !savingsAccount.getUserId().equals(request.getUserId())) {
            throw new RuntimeException("Account ownership validation failed");
        }

        // Validate savings account status
        if (!"ACTIVE".equals(savingsAccount.getStatus())) {
            throw new RuntimeException("Savings account is not active");
        }

        // Check payment account balance
        if (paymentAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance in payment account");
        }

        // Perform transfer
        paymentAccount.setBalance(paymentAccount.getBalance().subtract(request.getAmount()));
        paymentAccount.setLastTransactionAt(LocalDateTime.now());
        accountRepository.save(paymentAccount);

        savingsAccount.setBalance(savingsAccount.getBalance().add(request.getAmount()));
        savingsAccountRepository.save(savingsAccount);

        // Create transaction record
        Transaction transaction = Transaction.builder()
                .username("SYSTEM") // Or get from security context
                .senderAccountNumber(request.getFromAccountNumber())
                .receiverAccountNumber(request.getToAccountNumber())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .transactionType("PAYMENT_TO_SAVINGS")
                .status("COMPLETED")
                .description(request.getDescription())
                .transactionAt(LocalDateTime.now())
                .build();

        transactionRepository.save(transaction);
        log.info("Transfer completed successfully");
    }

    @Transactional
    public void transferFromSavingsToPayment(TransferRequest request) {
        log.info("Transfer from savings to payment: {} -> {}", 
                request.getFromAccountNumber(), request.getToAccountNumber());

        // Validate accounts
        SavingsAccount savingsAccount = savingsAccountRepository.findByAccountNumber(request.getFromAccountNumber())
                .orElseThrow(() -> new RuntimeException("Savings account not found"));

        Account paymentAccount = accountRepository.findByAccountNumber(request.getToAccountNumber())
                .orElseThrow(() -> new RuntimeException("Payment account not found"));

        // Validate ownership
        if (!savingsAccount.getUserId().equals(request.getUserId()) ||
            !paymentAccount.getUserId().equals(request.getUserId())) {
            throw new RuntimeException("Account ownership validation failed");
        }

        // Validate savings account status
        if (!"ACTIVE".equals(savingsAccount.getStatus())) {
            throw new RuntimeException("Savings account is not active");
        }

        // Check if savings account has matured (optional restriction)
        if (LocalDateTime.now().isBefore(savingsAccount.getMaturityDate())) {
            log.warn("Early withdrawal from savings account: {}", request.getFromAccountNumber());
            // You might want to apply penalty here
        }

        // Check savings account balance
        if (savingsAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance in savings account");
        }

        // Perform transfer
        savingsAccount.setBalance(savingsAccount.getBalance().subtract(request.getAmount()));
        savingsAccountRepository.save(savingsAccount);
        paymentAccount.setBalance(paymentAccount.getBalance().add(request.getAmount()));
        paymentAccount.setLastTransactionAt(LocalDateTime.now());
        accountRepository.save(paymentAccount);

        // Create transaction record
        Transaction transaction = Transaction.builder()
                .username("SYSTEM") // Or get from security context
                .senderAccountNumber(request.getFromAccountNumber())
                .receiverAccountNumber(request.getToAccountNumber())
                .amount(request.getAmount())
                .currency(request.getCurrency())
                .transactionType("SAVINGS_TO_PAYMENT")
                .status("COMPLETED")
                .description(request.getDescription())
                .transactionAt(LocalDateTime.now())
                .build();

        transactionRepository.save(transaction);
        if (savingsAccount.getBalance().subtract(request.getAmount()).compareTo(BigDecimal.ZERO) == 0) {
            savingsAccount.setStatus("CLOSE");
            savingsAccount.setUpdatedAt(LocalDateTime.now());
            savingsAccountRepository.save(savingsAccount);
        }
        log.info("Transfer completed successfully");
    }
}