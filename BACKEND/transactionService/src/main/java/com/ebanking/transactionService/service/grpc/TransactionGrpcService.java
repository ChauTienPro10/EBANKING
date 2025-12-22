package com.ebanking.transactionService.service.grpc;

import com.ebanking.transactionService.entity.Transaction;
import com.ebanking.transactionService.grpc.TransactionProto;
import com.ebanking.transactionService.grpc.TransactionServiceGrpc;
import com.ebanking.transactionService.service.TransactionService;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.LocalDateTime;
import java.util.List;

@GrpcService
public class TransactionGrpcService extends TransactionServiceGrpc.TransactionServiceImplBase {

    @Autowired
    TransactionService transactionService;

    @Override
    public void transfer(TransactionProto.TransferRequest request, StreamObserver<TransactionProto.TransferResponse> responseObserver) {
        try {
            responseObserver.onNext(transactionService.transfer(request));
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }
    }

    @Override
    public void history(TransactionProto.TransHistoryRequest request, StreamObserver<TransactionProto.TransactionList> responseObserver) {
        try {
            LocalDateTime fromDate = parseDateOrNull(request.getFromDate(), true);
            LocalDateTime toDate = parseDateOrNull(request.getToDate(), false);
            int pageIndex = Math.max(0, request.getPage());
            String search = request.getSender().isBlank() ? null : request.getSender();
            int pageSize = request.getLimit() > 0 ? request.getLimit() : 10;
            Page<Transaction> page = transactionService.getTransactionHistory(
                    search,
                    fromDate,
                    toDate,
                    pageIndex,
                    pageSize);
            List<Transaction> transactions = page.getContent();
            TransactionProto.TransactionList.Builder listBuilder = TransactionProto.TransactionList.newBuilder();
            for (Transaction tx : transactions) {
                TransactionProto.TransferResponse protoTx = TransactionProto.TransferResponse.newBuilder()
                        .setTransactionId(tx.getTransactionId())
                        .setSenderAccountNumber(tx.getSenderAccountNumber())
                        .setReceiverAccountNumber(tx.getReceiverAccountNumber())
                        .setAmount(tx.getAmount().toString())
                        .setCurrency(tx.getCurrency())
                        .setTransactionAt(tx.getTransactionAt().toString())
                        .setStatus(tx.getStatus())
                        .setDescription(tx.getDescription())
                        .setTransactionType(tx.getTransactionType())
                        .build();

                listBuilder.addTransactions(protoTx);
            }
            responseObserver.onNext(listBuilder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(
                    Status.INTERNAL
                            .withDescription(e.getMessage())
                            .asRuntimeException()
            );
        }

    }

    private LocalDateTime parseDateOrNull(String value, boolean isStartOfDay) {
        if (value == null || value.isBlank()) {
            return null;
        }
        try {
            LocalDate date = LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE);
            return isStartOfDay ? date.atStartOfDay() : date.atTime(23, 59, 59);
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
