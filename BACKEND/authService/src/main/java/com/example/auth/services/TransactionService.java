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
import lombok.extern.slf4j.Slf4j;
import lombok.extern.slf4j.XSlf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class TransactionService {

    private final TransactionMapper transactionMapper;
    private final TransactionServiceGrpc.TransactionServiceBlockingStub transactionServiceBlockingStub;

    @Autowired
    public TransactionService(grpcPath grpcPath, TransactionMapper transactionMapper) {
        this.transactionMapper = transactionMapper;
        ManagedChannel channel = ManagedChannelBuilder
                .forAddress(grpcPath.getTransactionServiceHost(), grpcPath.getTransactionServicePort())
                .usePlaintext()
                .build();
        this.transactionServiceBlockingStub = TransactionServiceGrpc.newBlockingStub(channel);
        log.info("HOST TRANSACTION::: {}:{}", grpcPath.getTransactionServiceHost(), grpcPath.getTransactionServicePort());
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
