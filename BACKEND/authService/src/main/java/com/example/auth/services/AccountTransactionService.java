package com.example.auth.services;

import com.example.auth.consts.grpcPath;
import com.example.auth.dto.request.NewAccountRequest;
import com.example.auth.dto.response.NewAccountResponse;
import com.example.auth.mapper.AccountTransactionMapper;
import com.example.auth.protopkg.AccountProto;
import com.example.auth.protopkg.AccountServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AccountTransactionService {
    private final AccountServiceGrpc.AccountServiceBlockingStub accountTransStub;

    @Autowired
    AccountTransactionMapper accountTransactionMapper;

    public AccountTransactionService() {
        ManagedChannel channel = ManagedChannelBuilder
                .forAddress(grpcPath.TRANSACTION_SERVICE, grpcPath.TRANSACTION_SERVICE_PORT)
                .usePlaintext()
                .build();
        this.accountTransStub = AccountServiceGrpc.newBlockingStub(channel);
    }

    public NewAccountResponse newAccount(NewAccountRequest rqData) {
        AccountProto.NewAccountRequest rq = accountTransactionMapper.accountReuestToProto(rqData);
        AccountProto.NewAccountResponse rs = accountTransStub.newAccount(rq);
        return accountTransactionMapper.protoToNewAccountResponse(rs);
    }
}
