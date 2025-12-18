package com.ebanking.adminTool.service;

import com.ebanking.adminTool.dto.response.DashboardStatsResponse;
import com.ebanking.adminTool.service.grpc.TransactionGrpcClient;
import com.ebanking.adminTool.utils.AuditLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminDashboardService {

    private final TransactionGrpcClient transactionGrpcClient;
    private final AuditLogger auditLogger;

    public DashboardStatsResponse getDashboardStats(String adminUsername) {
        try {
            log.info("Admin {} fetching dashboard statistics", adminUsername);

            // NOTE: TransactionService currently does not provide statistics APIs
            // Available gRPC methods: transfer(), history()
            // Missing required methods: getTransactionStats(), getAccountCount(), getUserCount()
            // To implement real stats, add these methods to transaction.proto:
            // - rpc getStatistics(StatisticsRequest) returns (StatisticsResponse);
            
            DashboardStatsResponse response = DashboardStatsResponse.builder()
                    .totalUsers(0L)
                    .totalAccounts(0L)
                    .totalTransactions(0L)
                    .totalTransactionsToday(0L)
                    .totalAmount("0")
                    .totalAmountToday("0")
                    .activeUsers(0L)
                    .lockedAccounts(0L)
                    .failedTransactions(0L)
                    .pendingTransactions(0L)
                    .build();

            auditLogger.logSuccess(
                    adminUsername,
                    "VIEW_DASHBOARD",
                    "SYSTEM",
                    null,
                    "Viewed dashboard statistics",
                    null);

            return response;

        } catch (Exception e) {
            log.error("Failed to get dashboard statistics", e);
            auditLogger.logFailure(
                    adminUsername,
                    "VIEW_DASHBOARD",
                    "SYSTEM",
                    null,
                    "Failed: " + e.getMessage(),
                    null);
            throw new com.ebanking.adminTool.exception.BusinessException(
                    "DASHBOARD_ERROR",
                    "Failed to get dashboard statistics: " + e.getMessage(),
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}