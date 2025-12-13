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
 * Uses ResilientGrpcClient for retry logic and error handling
 */
@Service
@Slf4j
public class TransactionGrpcClient {

    private final GrpcConfig grpcConfig;
    private final ResilientGrpcClient resilientClient;
    private ManagedChannel channel;
    private AccountServiceGrpc.AccountServiceBlockingStub accountStub;
    private TransactionServiceGrpc.TransactionServiceBlockingStub transactionStub;

    public TransactionGrpcClient(GrpcConfig grpcConfig, ResilientGrpcClient resilientClient) {
        this.grpcConfig = grpcConfig;
        this.resilientClient = resilientClient;
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
        return resilientClient.executeWithRetry(() -> {
            AccountProto.GetAccountInfo request = AccountProto.GetAccountInfo.newBuilder()
                    .setUserId(userId)
                    .build();
            return accountStub.getAccountInfo(request);
        }, "getAccountInfo");
    }

    /**
     * Check if account exists
     */
    public AccountProto.CheckAccountExistResponse checkAccountExist(String accountNumber) {
        return resilientClient.executeWithRetry(() -> {
            AccountProto.CheckAccountExistRequest request = AccountProto.CheckAccountExistRequest.newBuilder()
                    .setAccountNumber(accountNumber)
                    .build();
            return accountStub.checkAccountExist(request);
        }, "checkAccountExist");
    }

    /**
     * Create new account
     */
    public AccountProto.NewAccountResponse newAccount(String accountNumber, String accountType, Long userId) {
        return resilientClient.executeWithRetry(() -> {
            AccountProto.NewAccountRequest request = AccountProto.NewAccountRequest.newBuilder()
                    .setAccountNumber(accountNumber)
                    .setAccountType(accountType)
                    .setUserId(userId)
                    .build();
            return accountStub.newAccount(request);
        }, "newAccount");
    }

    // ==================== Transaction Operations ====================

    /**
     * Get transaction history
     */
    public TransactionProto.TransactionList getTransactionHistory(
            int page, int size, String search, String type, String status, String fromDate, String toDate) {
        return resilientClient.executeWithRetry(() -> {
            TransactionProto.TransHistoryRequest.Builder requestBuilder = TransactionProto.TransHistoryRequest.newBuilder()
                    .setPage(page)
                    .setLimit(size);

            // The gRPC service only supports username and sender for searching.
            // We will map the generic 'search' from FE to both fields for now.
            if (search != null && !search.isEmpty()) {
                requestBuilder.setUsername(search);
                requestBuilder.setSender(search);
            }

            // Type and Status are not supported by the gRPC service, so we ignore them.

            if (fromDate != null && !fromDate.isEmpty()) {
                requestBuilder.setFromDate(fromDate);
            }
            if (toDate != null && !toDate.isEmpty()) {
                requestBuilder.setToDate(toDate);
            }

            return transactionStub.history(requestBuilder.build());
        }, "getTransactionHistory");
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
        return resilientClient.executeWithRetry(() -> {
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
        }, "transfer");
    }

    // ==================== Dashboard Statistics Methods ====================

    /**
     * Get total number of accounts
     * FIXED: Added for dashboard statistics
     */
    public long getTotalAccounts() {
        try {
            // TODO: Implement in transactionService gRPC
            // For now, return 0 as placeholder
            log.warn("getTotalAccounts not yet implemented in gRPC service");
            return 0L;
        } catch (Exception e) {
            log.error("Error getting total accounts", e);
            return 0L;
        }
    }

    /**
     * Get total number of transactions
     * FIXED: Added for dashboard statistics
     */
    public long getTotalTransactions() {
        try {
            // TODO: Implement in transactionService gRPC
            // For now, return 0 as placeholder
            log.warn("getTotalTransactions not yet implemented in gRPC service");
            return 0L;
        } catch (Exception e) {
            log.error("Error getting total transactions", e);
            return 0L;
        }
    }

    /**
     * Count transactions by date
     * FIXED: Added for dashboard statistics
     */
    public long countTransactionsByDate(String date) {
        try {
            // TODO: Implement in transactionService gRPC
            // For now, return 0 as placeholder
            log.warn("countTransactionsByDate not yet implemented in gRPC service for date: {}", date);
            return 0L;
        } catch (Exception e) {
            log.error("Error counting transactions by date: {}", date, e);
            return 0L;
        }
    }

    /**
     * Sum transactions amount by date
     * FIXED: Added for dashboard statistics
     */
    public String sumTransactionsByDate(String date) {
        try {
            // TODO: Implement in transactionService gRPC
            // For now, return "0" as placeholder
            log.warn("sumTransactionsByDate not yet implemented in gRPC service for date: {}", date);
            return "0";
        } catch (Exception e) {
            log.error("Error summing transactions by date: {}", date, e);
            return "0";
        }
    }

    /**
     * Count locked accounts
     * FIXED: Added for dashboard statistics
     */
    public long countLockedAccounts() {
        try {
            // TODO: Implement in transactionService gRPC
            // For now, return 0 as placeholder
            log.warn("countLockedAccounts not yet implemented in gRPC service");
            return 0L;
        } catch (Exception e) {
            log.error("Error counting locked accounts", e);
            return 0L;
        }
    }

    /**
     * Count failed transactions
     * FIXED: Added for dashboard statistics
     */
    public long countFailedTransactions() {
        try {
            // TODO: Implement in transactionService gRPC
            // For now, return 0 as placeholder
            log.warn("countFailedTransactions not yet implemented in gRPC service");
            return 0L;
        } catch (Exception e) {
            log.error("Error counting failed transactions", e);
            return 0L;
        }
    }

    /**
     * Count pending transactions
     * FIXED: Added for dashboard statistics
     */
    public long countPendingTransactions() {
        try {
            // TODO: Implement in transactionService gRPC
            // For now, return 0 as placeholder
            log.warn("countPendingTransactions not yet implemented in gRPC service");
            return 0L;
        } catch (Exception e) {
            log.error("Error counting pending transactions", e);
            return 0L;
        }
    }
}