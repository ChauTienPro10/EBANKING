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
import org.apache.tomcat.websocket.AuthenticationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class TransactionService {

    @Autowired private PinCodeService pinCodeService;
    private final TransactionMapper transactionMapper;
    private final TransactionServiceGrpc.TransactionServiceBlockingStub transactionServiceBlockingStub;
    private final EkycService ekycService;

    @Autowired
    public TransactionService(grpcPath grpcPath, TransactionMapper transactionMapper, EkycService ekycService) {
        this.transactionMapper = transactionMapper;
        this.ekycService = ekycService;
        ManagedChannel channel = ManagedChannelBuilder
                .forAddress(grpcPath.getTransactionServiceHost(), grpcPath.getTransactionServicePort())
                .usePlaintext()
                .build();
        this.transactionServiceBlockingStub = TransactionServiceGrpc.newBlockingStub(channel);
        log.info("HOST TRANSACTION::: {}:{}", grpcPath.getTransactionServiceHost(), grpcPath.getTransactionServicePort());
    }

    public TransferResponse transfer(TransferRequest request) throws AuthenticationException {
        if (!pinCodeService.checkPin(request.getUsername(), request.getPin())) {
            throw new AuthenticationException("error:text_pin_not_true");
        }
        TransactionProto.TransferRequest rq = transactionMapper.toTransferRequestProto(request);
        TransactionProto.TransferResponse rs = transactionServiceBlockingStub.transfer(rq);
        
        // Link transaction ID to face auth verification if face auth was used
        if (request.getRequiresFaceAuth() != null && request.getRequiresFaceAuth() 
                && request.getFaceAuthSessionId() != null && !request.getFaceAuthSessionId().isEmpty()) {
            try {
                ekycService.linkTransactionToFaceAuth(request.getFaceAuthSessionId(), rs.getTransactionId());
                log.info("Linked transaction {} to face auth session {}", rs.getTransactionId(), request.getFaceAuthSessionId());
            } catch (Exception e) {
                log.error("Failed to link transaction to face auth: {}", e.getMessage());
            }
        }
        
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
