package com.ebanking.transactionService.mappers;

import com.ebanking.transactionService.entity.Account;
import org.springframework.stereotype.Service;
import java.time.format.DateTimeFormatter;
import com.ebanking.transactionService.grpc.AccountProto;

@Service
public class AccountMapper {
    private static final DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public AccountProto.NewAccountResponse accountToNewAccountProto(Account account) {
        if (account == null) {
            return null;
        }

        AccountProto.NewAccountResponse.Builder builder = AccountProto.NewAccountResponse.newBuilder()
                .setAccountId(account.getAccountId())
                .setAccountNumber(account.getAccountNumber())
                .setAccountType(account.getAccountType())
                .setBalance(account.getBalance().toPlainString())
                .setCurrency(account.getCurrency())
                .setStatus(account.getStatus());

        if (account.getOpenedDate() != null) {
            builder.setOpenedDate(account.getOpenedDate().format(formatter));
        }

        if (account.getCreatedAt() != null) {
            builder.setCreatedAt(account.getCreatedAt().format(formatter));
        }

        return builder.build();
    }

}
