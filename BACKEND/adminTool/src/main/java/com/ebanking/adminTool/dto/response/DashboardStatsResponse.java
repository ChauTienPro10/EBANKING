package com.ebanking.adminTool.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Dashboard Statistics Response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    private Long totalUsers;
    private Long totalAccounts;
    private Long totalTransactions;
    private Long totalTransactionsToday;
    private String totalAmount;
    private String totalAmountToday;
    private Long activeUsers;
    private Long lockedAccounts;
    private Long failedTransactions;
    private Long pendingTransactions;
    private Long successfulTransactions;
    private Long suspiciousTransactions;

    // Safeguard arrays for charts (never null)
    @Builder.Default
    private List<DailyCount> dailyTransactionCounts = java.util.Collections.emptyList();

    @Builder.Default
    private List<TypeCount> accountTypeDistribution = java.util.Collections.emptyList();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyCount {
        private String date; // ISO yyyy-MM-dd
        private Long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TypeCount {
        private String type;
        private Long count;
    }
}
