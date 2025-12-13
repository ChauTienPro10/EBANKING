package com.ebanking.admintool.service;

import com.ebanking.admintool.dto.response.DashboardStatsResponse;
import com.ebanking.admintool.service.grpc.TransactionGrpcClient;
import com.ebanking.admintool.utils.AuditLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

/**
 * Admin Dashboard Service
 * Provides aggregated statistics for the dashboard
 * FIXED: Now fetches real data from gRPC services instead of hardcoded zeros
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AdminDashboardService {

    private final TransactionGrpcClient transactionGrpcClient;
    private final AuditLogger auditLogger;

    /**
     * Get dashboard statistics from gRPC services
     * FIXED: Fetches real data instead of returning hardcoded zeros
     */
    public DashboardStatsResponse getDashboardStats(String adminUsername) {
        try {
            log.info("Admin {} fetching dashboard statistics", adminUsername);

            // Fetch real statistics from gRPC service
            long totalAccounts = 0;
            long totalTransactions = 0;
            long todayTransactions = 0;
            String todayAmount = "0";
            long lockedAccounts = 0;
            long failedTransactions = 0;
            long pendingTransactions = 0;

            try {
                // FIXED: Fetch real data from transaction service
                totalAccounts = transactionGrpcClient.getTotalAccounts();
                totalTransactions = transactionGrpcClient.getTotalTransactions();
                todayTransactions = transactionGrpcClient.countTransactionsByDate(LocalDate.now().toString());
                todayAmount = transactionGrpcClient.sumTransactionsByDate(LocalDate.now().toString());
                lockedAccounts = transactionGrpcClient.countLockedAccounts();
                failedTransactions = transactionGrpcClient.countFailedTransactions();
                pendingTransactions = transactionGrpcClient.countPendingTransactions();

                log.debug("Dashboard stats - Accounts: {}, Transactions: {}, Today: {}",
                        totalAccounts, totalTransactions, todayTransactions);
            } catch (Exception e) {
                log.warn("Could not fetch some dashboard statistics from gRPC service: {}", e.getMessage());
                // Continue with partial data rather than failing completely
            }

            // Build response with real data
            DashboardStatsResponse response = DashboardStatsResponse.builder()
                    .totalUsers(0L) // TODO: Fetch from UserService when available
                    .totalAccounts(totalAccounts)
                    .totalTransactions(totalTransactions)
                    .totalTransactionsToday(todayTransactions)
                    .totalAmount("0") // TODO: Fetch total amount from TransactionService
                    .totalAmountToday(todayAmount)
                    .activeUsers(0L) // TODO: Fetch from UserService when available
                    .lockedAccounts(lockedAccounts)
                    .failedTransactions(failedTransactions)
                    .pendingTransactions(pendingTransactions)
                    .build();

            // Log the action
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
            throw new com.ebanking.admintool.exception.BusinessException(
                    "DASHBOARD_ERROR",
                    "Failed to get dashboard statistics: " + e.getMessage(),
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}