package com.example.auth.mapper;

import com.example.auth.dto.request.NewAccountRequest;
import com.example.auth.dto.response.AccountResponse;
import com.example.auth.dto.response.NewAccountResponse;
import com.example.auth.protopkg.AccountProto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class AccountTransactionMapper {
    public AccountProto.NewAccountRequest accountReuestToProto(NewAccountRequest rq) {
        if (rq == null) {
            return null;
        }

        return AccountProto.NewAccountRequest.newBuilder()
                .setAccountNumber(rq.getAccountNumber())
                .setAccountType(rq.getAccountType())
                .setUserId(rq.getUserId())
                .build();
    }

    public NewAccountResponse protoToNewAccountResponse(AccountProto.NewAccountResponse protoData) {
        if (protoData == null) {
            return null;
        }

        protoData.getBalance();
        return NewAccountResponse.builder()
                .accountId(protoData.getAccountId())
                .accountNumber(protoData.getAccountNumber())
                .accountType(protoData.getAccountType())
                .balance(!protoData.getBalance().isEmpty()
                        ? new BigDecimal(protoData.getBalance())
                        : null)
                .currency(protoData.getCurrency())
                .status(protoData.getStatus())
                .openedDate(protoData.getOpenedDate())
                .createdAt(protoData.getCreatedAt())
                .build();
    }


    public AccountResponse fromProto(AccountProto.AccountResponse proto) {
        DateTimeFormatter formatter = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

        AccountResponse account = new AccountResponse();
        account.setAccountId(proto.getAccountId());
        account.setAccountNumber(proto.getAccountNumber());
        account.setAccountType(proto.getAccountType());
        account.setBalance(new BigDecimal(proto.getBalance())); // Chuyển từ string -> BigDecimal
        account.setCurrency(proto.getCurrency());
        account.setStatus(proto.getStatus());

        account.setOpenedDate(String.valueOf(LocalDateTime.parse(proto.getOpenedDate(), formatter)));
        account.setCreatedAt(String.valueOf(LocalDateTime.parse(proto.getCreatedAt(), formatter)));

        return account;
    }

}
