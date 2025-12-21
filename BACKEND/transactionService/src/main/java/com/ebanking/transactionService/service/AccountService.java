package com.ebanking.transactionService.service;

import com.ebanking.transactionService.entity.Account;
import com.ebanking.transactionService.entity.TransactionLimit;
import com.ebanking.transactionService.enums.AccountType;
import com.ebanking.transactionService.enums.Currency;
import com.ebanking.transactionService.enums.Status;
import com.ebanking.transactionService.mappers.AccountMapper;
import com.ebanking.transactionService.repository.AccountRepository;
import com.ebanking.transactionService.repository.TransactionLimitRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ebanking.transactionService.grpc.AccountProto;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
@Slf4j
public class AccountService {
    @Autowired
    AccountRepository accountRepository;

    @Autowired
    AccountMapper accountMapper;

    @Autowired
    TransactionLimitRepository limitRepository;

    // Default limits for new accounts
    private static final BigDecimal DEFAULT_DAILY_LIMIT = new BigDecimal("50000000");
    private static final BigDecimal DEFAULT_SINGLE_LIMIT = new BigDecimal("10000000");

    @Transactional
    public AccountProto.NewAccountResponse newAccount(AccountProto.NewAccountRequest requestData) {
        if (accountRepository.findByUserId(requestData.getUserId()) != null) {
            return null;
        }
        
        // Create account
        Account acc = Account.builder()
                .accountNumber(requestData.getAccountNumber())
                .accountType(AccountType.fromName(requestData.getAccountType()).name())
                .balance(BigDecimal.valueOf(50000))
                .currency(Currency.VND.name())
                .status(Status.ACTIVE.name())
                .openedDate(LocalDateTime.now())
                .isPrimary(true)
                .userId(requestData.getUserId())
                .createdAt(LocalDateTime.now())
                .build();
        
        Account savedAccount = accountRepository.save(acc);
        
        // Auto-create default transaction limits
        createDefaultLimitsForNewUser(requestData.getUserId());
        
        log.info("Created new account and default limits for user: {}", requestData.getUserId());
        
        return accountMapper.accountToNewAccountProto(savedAccount);
    }

    /**
     * Create default transaction limits for new user
     */
    private void createDefaultLimitsForNewUser(Long userId) {
        LocalDate today = LocalDate.now();
        
        // Check if limits already exist for today
        if (limitRepository.findByUserIdAndLimitDate(userId, today).isPresent()) {
            log.info("Limits already exist for user {} on {}", userId, today);
            return;
        }
        
        TransactionLimit defaultLimit = new TransactionLimit();
        defaultLimit.setUserId(userId);
        defaultLimit.setLimitDate(today);
        defaultLimit.setDailyLimit(DEFAULT_DAILY_LIMIT);
        defaultLimit.setSingleTransactionLimit(DEFAULT_SINGLE_LIMIT);
        defaultLimit.setUsedAmount(BigDecimal.ZERO);
        defaultLimit.setCreatedAt(LocalDateTime.now());
        defaultLimit.setUpdatedAt(LocalDateTime.now());
        
        limitRepository.save(defaultLimit);
        
        log.info("Created default limits for user {}: daily={}, single={}", 
                userId, DEFAULT_DAILY_LIMIT, DEFAULT_SINGLE_LIMIT);
    }

    public AccountProto.AccountResponse getAccountInfo(AccountProto.GetAccountInfo rq) {
        Account account = accountRepository.findByUserId(rq.getUserId());
        return accountMapper.toProto(account);
    }

    public AccountProto.CheckAccountExistResponse isAccountExist(AccountProto.CheckAccountExistRequest rq) {
        Account account = accountRepository.findByAccountNumber(rq.getAccountNumber()).get();
        if (account == null) {
            return AccountProto.CheckAccountExistResponse.newBuilder()
                    .setUserId(-1)
                    .setExist(false)
                    .build();
        }
        return AccountProto.CheckAccountExistResponse.newBuilder()
                .setExist(true)
                .setUserId(account.getUserId())
                .build();
    }


}
