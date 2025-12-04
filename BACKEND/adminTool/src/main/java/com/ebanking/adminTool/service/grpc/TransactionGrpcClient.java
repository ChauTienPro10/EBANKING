package com.ebanking.admintool.service.grpc;

import com.ebanking.admintool.config.GrpcConfig;
import com.ebanking.transactionService.grpc.AccountProto;
import com.ebanking.transactionService.grpc.AccountServiceGrpc;
import com.ebanking.transactionService.grpc.TransactionProto;
import com.ebanking.transactionService.grpc.TransactionServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

/**
 * gRPC Client for Transaction Service
 * Handles both Account and Transaction operations
 */
@Service
@Slf4j
public class TransactionGrpcClient {

    private final GrpcConfig grpcConfig;
    private ManagedChannel channel;
    private AccountServiceGrpc.AccountServiceBlockingStub accountStub;
    private TransactionServiceGrpc.TransactionServiceBlockingStub transactionStub;

    public TransactionGrpcClient(GrpcConfig grpcConfig) {
        this.grpcConfig = grpcConfig;
    }

    @PostConstruct
    public void init() {
        channel = ManagedChannelBuilder
                .forAddress(grpcConfig.getTransactionServiceHost(), grpcConfig.getTransactionServicePort())
                .usePlaintext()
                .build();

        accountStub = AccountServiceGrpc.newBlockingStub(channel);
        transactionStub = TransactionServiceGrpc.newBlockingStub(channel);
        
        log.info("TransactionGrpcClient initialized: {}:{}", 
                grpcConfig.getTransactionServiceHost(), grpcConfig.getTransactionServicePort());
    }

    @PreDestroy
    public void shutdown() {
        if (channel != null && !channel.isShutdown()) {
            channel.shutdown();
            log.info("TransactionGrpcClient channel shutdown");
        }
    }

    // ==================== Account Operations ====================

    /**
     * Get account info by user ID
     */
    public AccountProto.AccountResponse getAccountInfo(Long userId) {
        AccountProto.GetAccountInfo request = AccountProto.GetAccountInfo.newBuilder()
                .setUserId(userId)
                .build();
        return accountStub.getAccountInfo(request);
    }

    /**
     * Check if account exists
     */
    public AccountProto.CheckAccountExistResponse checkAccountExist(String accountNumber) {
        AccountProto.CheckAccountExistRequest request = AccountProto.CheckAccountExistRequest.newBuilder()
                .setAccountNumber(accountNumber)
                .build();
        return accountStub.checkAccountExist(request);
    }

    /**
     * Create new account
     */
    public AccountProto.NewAccountResponse newAccount(String accountNumber, String accountType, Long userId) {
        AccountProto.NewAccountRequest request = AccountProto.NewAccountRequest.newBuilder()
                .setAccountNumber(accountNumber)
                .setAccountType(accountType)
                .setUserId(userId)
                .build();
        return accountStub.newAccount(request);
    }

    // ==================== Transaction Operations ====================

    /**
     * Get transaction history
     */
    public TransactionProto.TransactionList getTransactionHistory(
            int page, int limit, String username, String sender, String fromDate, String toDate) {
        TransactionProto.TransHistoryRequest request = TransactionProto.TransHistoryRequest.newBuilder()
                .setPage(page)
                .setLimit(limit)
                .setUsername(username != null ? username : "")
                .setSender(sender != null ? sender : "")
                .setFromDate(fromDate != null ? fromDate : "")
                .setToDate(toDate != null ? toDate : "")
                .build();
        return transactionStub.history(request);
    }

    /**
     * Transfer money
     */
    public TransactionProto.TransferResponse transfer(
            String senderAccountNumber,
            String receiverAccountNumber,
            String amount,
            String currency,
            String transactionType,
            String description,
            String username) {
        TransactionProto.TransferRequest request = TransactionProto.TransferRequest.newBuilder()
                .setSenderAccountNumber(senderAccountNumber)
                .setReceiverAccountNumber(receiverAccountNumber)
                .setAmount(amount)
                .setCurrency(currency)
                .setTransactionType(transactionType)
                .setDescription(description)
                .setUsername(username)
                .build();
        return transactionStub.transfer(request);
    }
}

