package com.ebanking.admintool.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}

