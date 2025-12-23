package com.ebanking.transactionService.service.grpc;

import com.ebanking.transactionService.entity.Transaction;
import com.ebanking.transactionService.grpc.TransactionProto;
import com.ebanking.transactionService.grpc.TransactionServiceGrpc;
import com.ebanking.transactionService.service.TransactionService;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
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
            log.info("🔍 gRPC history called - sender: '{}', page: {}, limit: {}", 
                     request.getSender(), request.getPage(), request.getLimit());
            
            LocalDateTime fromDate = parseDateOrNull(request.getFromDate(), true);
            LocalDateTime toDate = parseDateOrNull(request.getToDate(), false);
            // Frontend sends 1-based page numbers, but Spring Data JPA uses 0-based indexing
            // So we need to subtract 1 to get the correct page
            int pageIndex = Math.max(0, request.getPage() - 1);
            String search = request.getSender().isBlank() ? null : request.getSender();
            int pageSize = request.getLimit() > 0 ? request.getLimit() : 10;
            
            log.info("🔍 Calling transactionService.getTransactionHistory with pageIndex: {}", pageIndex);
            
            Page<Transaction> page = transactionService.getTransactionHistory(
                    search,
                    fromDate,
                    toDate,
                    pageIndex,
                    pageSize);
            
            List<Transaction> transactions = page.getContent();
            log.info("✅ Got {} transactions from service, total elements: {}", 
                     transactions.size(), page.getTotalElements());
            
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
            
            TransactionProto.TransactionList response = listBuilder.build();
            log.info("✅ Built gRPC response with {} transactions", response.getTransactionsCount());
            
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("❌ Error in gRPC history: {}", e.getMessage(), e);
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
