package com.ebanking.transactionService.mappers;

import com.ebanking.transactionService.entity.Transaction;
import org.springframework.stereotype.Service;
import com.ebanking.transactionService.grpc.TransactionProto;

@Service
public class TransactionMapper {
    public TransactionProto.TransferResponse toTransferRequestProto(Transaction transaction) {
        if (transaction == null) {
            return null;
        }

        return TransactionProto.TransferResponse.newBuilder()
                .setTransactionId(transaction.getTransactionId())
                .setSenderAccountNumber(transaction.getSenderAccountNumber())
                .setReceiverAccountNumber(transaction.getReceiverAccountNumber())
                .setAmount(transaction.getAmount().toPlainString()) // BigDecimal → String
                .setCurrency(transaction.getCurrency())
                .setTransactionType(transaction.getTransactionType())
                .setDescription(transaction.getDescription() != null ? transaction.getDescription() : "")
                .setStatus(transaction.getStatus())
                .setTransactionAt(transaction.getTransactionAt() != null ? transaction.getTransactionAt().toString() : "")
                .build();
    }

}
