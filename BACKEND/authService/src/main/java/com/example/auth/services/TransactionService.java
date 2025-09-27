package com.example.auth.services;

import com.example.auth.consts.grpcPath;
import com.example.auth.dto.request.TransferRequest;
import com.example.auth.dto.response.TransferResponse;
import com.example.auth.mapper.TransactionMapper;
import com.example.auth.protopkg.AccountServiceGrpc;
import com.example.auth.protopkg.TransactionProto;
import com.example.auth.protopkg.TransactionServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TransactionService {

    @Autowired
    TransactionMapper transactionMapper;

    private final TransactionServiceGrpc.TransactionServiceBlockingStub transactionServiceBlockingStub;

    public TransactionService() {
        ManagedChannel channel = ManagedChannelBuilder
                .forAddress(grpcPath.TRANSACTION_SERVICE, grpcPath.TRANSACTION_SERVICE_PORT)
                .usePlaintext()
                .build();
        this.transactionServiceBlockingStub = TransactionServiceGrpc.newBlockingStub(channel);
    }

    public TransferResponse transfer(TransferRequest request) {
        TransactionProto.TransferRequest rq = transactionMapper.toTransferRequestProto(request);
        TransactionProto.TransferResponse rs = transactionServiceBlockingStub.transfer(rq);
        return transactionMapper.toTranserResponseDto(rs);
    }

    public List<TransferResponse> getHisTrans(TransactionProto.TransHistoryRequest request) {
        TransactionProto.TransactionList protobufList = transactionServiceBlockingStub.history(request);

        return protobufList.getTransactionsList()
                .stream()
                .map(transactionMapper::toTranserResponseDto)
                .toList();
    }
}
