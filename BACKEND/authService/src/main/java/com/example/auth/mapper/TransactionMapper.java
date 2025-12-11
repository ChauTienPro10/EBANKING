package com.example.auth.mapper;

import com.example.auth.dto.request.TransferRequest;
import com.example.auth.dto.response.TransferResponse;
import com.example.auth.protopkg.TransactionProto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class TransactionMapper {
    public TransactionProto.TransferRequest toTransferRequestProto(TransferRequest request) {
        if (request == null) {
            return null;
        }

        return TransactionProto.TransferRequest.newBuilder()
                .setSenderAccountNumber(request.getSenderAccountNumber())
                .setReceiverAccountNumber(request.getReceiverAccountNumber())
                .setAmount(String.valueOf(request.getAmount())) // Long → String
                .setCurrency(request.getCurrency())
                .setTransactionType(request.getTransactionType())
                .setDescription(
                        request.getDescription() != null ? request.getDescription() : ""
                )
                .setUsername(request.getUsername())
                // Face authentication fields
                .setRequiresFaceAuth(request.getRequiresFaceAuth() != null ? request.getRequiresFaceAuth() : false)
                .setFaceAuthSessionId(request.getFaceAuthSessionId() != null ? request.getFaceAuthSessionId() : "")
                .build();
    }

    public TransferResponse toTranserResponseDto(TransactionProto.TransferResponse transferResponse) {
        if (transferResponse == null) {
            return null;
        }

        return TransferResponse.builder()
                .transactionId(transferResponse.getTransactionId())
                .senderAccountNumber(transferResponse.getSenderAccountNumber())
                .receiverAccountNumber(transferResponse.getReceiverAccountNumber())
                .amount(new BigDecimal(transferResponse.getAmount()))
                .currency(transferResponse.getCurrency())
                .transactionType(transferResponse.getTransactionType())
                .description(transferResponse.getDescription())
                .status(transferResponse.getStatus())
                .transactionAt(transferResponse.getTransactionAt())
                .build();
    }

}
