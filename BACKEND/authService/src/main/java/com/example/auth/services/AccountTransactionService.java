package com.example.auth.services;

import com.example.auth.consts.grpcPath;
import com.example.auth.dto.request.CheckAccountNumberRequest;
import com.example.auth.dto.request.NewAccountRequest;
import com.example.auth.dto.response.AccountResponse;
import com.example.auth.dto.response.CheckAccountNumberResponse;
import com.example.auth.dto.response.NewAccountResponse;
import com.example.auth.dto.response.UpdateUserResponse;
import com.example.auth.mapper.AccountTransactionMapper;
import com.example.auth.protopkg.AccountProto;
import com.example.auth.protopkg.AccountServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AccountTransactionService {
    private final AccountTransactionMapper accountTransactionMapper;
    private final AccountServiceGrpc.AccountServiceBlockingStub accountTransStub;

    @Autowired
    public AccountTransactionService(grpcPath grpcPath, AccountTransactionMapper accountTransactionMapper) {
        this.accountTransactionMapper = accountTransactionMapper;

        ManagedChannel channel = ManagedChannelBuilder
                .forAddress(grpcPath.getTransactionServiceHost(), grpcPath.getTransactionServicePort())
                .usePlaintext()
                .build();

        this.accountTransStub = AccountServiceGrpc.newBlockingStub(channel);
        log.info("HOST TRANSACTION::: {}:{}", grpcPath.getTransactionServiceHost(), grpcPath.getTransactionServicePort());

    }

    @Autowired AuthService authService;

    public NewAccountResponse newAccount(NewAccountRequest rqData) {
        AccountProto.NewAccountRequest rq = accountTransactionMapper.accountReuestToProto(rqData);
        AccountProto.NewAccountResponse rs = accountTransStub.newAccount(rq);
        return accountTransactionMapper.protoToNewAccountResponse(rs);
    }

    public AccountResponse getAccountInfo(long userId) {
        AccountProto.GetAccountInfo rq = AccountProto.GetAccountInfo.newBuilder()
                .setUserId(userId)
                .build();
        AccountProto.AccountResponse rs = accountTransStub.getAccountInfo(rq);
        return accountTransactionMapper.fromProto(rs);
    }

    public CheckAccountNumberResponse checkAccountExist(CheckAccountNumberRequest rq) {
        AccountProto.CheckAccountExistRequest r = AccountProto.CheckAccountExistRequest.newBuilder()
                .setAccountNumber(rq.getAccountNumber())
                .build();
        AccountProto.CheckAccountExistResponse rs = accountTransStub.checkAccountExist(r);
        if (!rs.getExist()) {
            return CheckAccountNumberResponse.builder()
                    .isExist(false).build();
        }
        UpdateUserResponse userInfo = authService.getUserInfo(rs.getUserId());
        return CheckAccountNumberResponse.builder()
                .isExist(true)
                .fullName(userInfo.getFullName())
                .build();

    }
}
