package com.ebanking.transactionService.service;

import com.ebanking.transactionService.entity.Account;
import com.ebanking.transactionService.enums.AccountType;
import com.ebanking.transactionService.enums.Currency;
import com.ebanking.transactionService.enums.Status;
import com.ebanking.transactionService.mappers.AccountMapper;
import com.ebanking.transactionService.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.ebanking.transactionService.grpc.AccountProto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class AccountService {
    @Autowired
    AccountRepository accountRepository;

    @Autowired
    AccountMapper accountMapper;

    public AccountProto.NewAccountResponse newAccount(AccountProto.NewAccountRequest requestData) {
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
        return accountMapper.accountToNewAccountProto(accountRepository.save(acc));
    }

    public AccountProto.AccountResponse getAccountInfo(AccountProto.GetAccountInfo rq) {
        Account account = accountRepository.findByUserId(rq.getUserId());
        return accountMapper.toProto(account);
    }

    public AccountProto.CheckAccountExistResponse isAccountExist(AccountProto.CheckAccountExistRequest rq) {
        Account account = accountRepository.findByAccountNumber(rq.getAccountNumber());
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
