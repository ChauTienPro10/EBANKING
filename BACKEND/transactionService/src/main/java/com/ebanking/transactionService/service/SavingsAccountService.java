package com.ebanking.transactionService.service;

import com.ebanking.transactionService.dto.*;
import com.ebanking.transactionService.entity.*;
import com.ebanking.transactionService.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class SavingsAccountService {

    private final SavingsAccountRepository savingsAccountRepository;
    private final AccountRepository accountRepository;
    private final InterestRateRepository interestRateRepository;
    private final TransactionRepository transactionRepository;

    @Transactional
    public SavingsAccountDto createSavingsAccount(CreateSavingsAccountRequest request) {
        log.info("Creating savings account for user: {}", request.getUserId());

        // Validate payment account exists and belongs to user
        Account paymentAccount = accountRepository.findById(request.getPaymentAccountId())
                .orElseThrow(() -> new RuntimeException("Payment account not found"));

        if (!paymentAccount.getUserId().equals(request.getUserId())) {
            throw new RuntimeException("Payment account does not belong to user");
        }

        // Validate interest rate
        InterestRate interestRate = interestRateRepository.findById(request.getInterestRateId())
                .orElseThrow(() -> new RuntimeException("Interest rate not found"));

        if (!"ACTIVE".equals(interestRate.getStatus())) {
            throw new RuntimeException("Interest rate is not active");
        }

        // Check if amount meets minimum requirement
        if (request.getInitialAmount().compareTo(interestRate.getMinAmount()) < 0) {
            throw new RuntimeException("Initial amount is below minimum requirement");
        }

        // Check payment account balance
        if (paymentAccount.getBalance().compareTo(request.getInitialAmount()) < 0) {
            throw new RuntimeException("Insufficient balance in payment account");
        }

        // Generate unique account number
        String accountNumber = generateSavingsAccountNumber();

        // Calculate maturity date
        LocalDateTime maturityDate = LocalDateTime.now().plusMonths(request.getTermMonths());

        // Create savings account
        SavingsAccount savingsAccount = SavingsAccount.builder()
                .accountNumber(accountNumber)
                .userId(request.getUserId())
                .paymentAccountId(request.getPaymentAccountId())
                .balance(request.getInitialAmount())
                .currency(request.getCurrency())
                .interestRateId(request.getInterestRateId())
                .termMonths(request.getTermMonths())
                .status("ACTIVE")
                .openedDate(LocalDateTime.now())
                .maturityDate(maturityDate)
                .totalInterestEarned(BigDecimal.ZERO)
                .build();

        savingsAccount = savingsAccountRepository.save(savingsAccount);

        // Deduct from payment account
        paymentAccount.setBalance(paymentAccount.getBalance().subtract(request.getInitialAmount()));
        paymentAccount.setLastTransactionAt(LocalDateTime.now());
        accountRepository.save(paymentAccount);

        // Create transaction record
        Transaction transaction = Transaction.builder()
                .username("SYSTEM") // Or get from security context
                .senderAccountNumber(paymentAccount.getAccountNumber())
                .receiverAccountNumber(accountNumber)
                .amount(request.getInitialAmount())
                .currency(request.getCurrency())
                .transactionType("SAVINGS_DEPOSIT")
                .status("COMPLETED")
                .description("Initial deposit to savings account")
                .transactionAt(LocalDateTime.now())
                .build();

        transactionRepository.save(transaction);

        log.info("Savings account created successfully: {}", accountNumber);
        return convertToDto(savingsAccount, interestRate, paymentAccount.getAccountNumber());
    }

    public List<SavingsAccountDto> getUserSavingsAccounts(Long userId) {
        List<SavingsAccount> accounts = savingsAccountRepository.findByUserId(userId);
        return accounts.stream()
                .map(account -> {
                    InterestRate rate = interestRateRepository.findById(account.getInterestRateId()).orElse(null);
                    Account paymentAccount = accountRepository.findById(account.getPaymentAccountId()).orElse(null);
                    String paymentAccountNumber = paymentAccount != null ? paymentAccount.getAccountNumber() : null;
                    return convertToDto(account, rate, paymentAccountNumber);
                })
                .collect(Collectors.toList());
    }

    public Optional<SavingsAccountDto> getSavingsAccountByNumber(String accountNumber) {
        return savingsAccountRepository.findByAccountNumber(accountNumber)
                .map(account -> {
                    InterestRate rate = interestRateRepository.findById(account.getInterestRateId()).orElse(null);
                    Account paymentAccount = accountRepository.findById(account.getPaymentAccountId()).orElse(null);
                    String paymentAccountNumber = paymentAccount != null ? paymentAccount.getAccountNumber() : null;
                    return convertToDto(account, rate, paymentAccountNumber);
                });
    }

    private String generateSavingsAccountNumber() {
        String prefix = "SAV";
        String suffix;
        String accountNumber;
        
        do {
            suffix = String.valueOf(System.currentTimeMillis() % 1000000000L);
            accountNumber = prefix + suffix;
        } while (savingsAccountRepository.existsByAccountNumber(accountNumber));
        
        return accountNumber;
    }

    private SavingsAccountDto convertToDto(SavingsAccount account, InterestRate rate, String paymentAccountNumber) {
        return SavingsAccountDto.builder()
                .savingsAccountId(account.getSavingsAccountId())
                .accountNumber(account.getAccountNumber())
                .userId(account.getUserId())
                .paymentAccountId(account.getPaymentAccountId())
                .paymentAccountNumber(paymentAccountNumber)
                .balance(account.getBalance())
                .currency(account.getCurrency())
                .interestRateId(account.getInterestRateId())
                .annualRate(rate != null ? rate.getAnnualRate() : null)
                .termMonths(account.getTermMonths())
                .status(account.getStatus())
                .openedDate(account.getOpenedDate())
                .maturityDate(account.getMaturityDate())
                .closedDate(account.getClosedDate())
                .totalInterestEarned(account.getTotalInterestEarned())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}