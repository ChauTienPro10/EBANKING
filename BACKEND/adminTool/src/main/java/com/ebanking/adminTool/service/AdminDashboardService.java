package com.ebanking.admintool.service;

import com.ebanking.admintool.dto.response.DashboardStatsResponse;
import com.ebanking.admintool.utils.AuditLogger;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Admin Dashboard Service
 * Provides aggregated statistics for the dashboard
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AdminDashboardService {

    private final AuditLogger auditLogger;

    /**
     * Get dashboard statistics
     * TODO: Implement actual data aggregation from gRPC services
     */
    public DashboardStatsResponse getDashboardStats(String adminUsername) {
        try {
            log.info("Admin {} fetching dashboard statistics", adminUsername);

            // TODO: Call gRPC services to get actual statistics
            // For now, returning mock data
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

            // Log the action
            auditLogger.logSuccess(
                    adminUsername,
                    "VIEW_DASHBOARD",
                    "SYSTEM",
                    null,
                    "Viewed dashboard statistics"
            );

            return response;

        } catch (Exception e) {
            log.error("Failed to get dashboard statistics", e);
            auditLogger.logFailure(
                    adminUsername,
                    "VIEW_DASHBOARD",
                    "SYSTEM",
                    null,
                    "Failed: " + e.getMessage()
            );
            throw new RuntimeException("Failed to get dashboard statistics: " + e.getMessage());
        }
    }
}

