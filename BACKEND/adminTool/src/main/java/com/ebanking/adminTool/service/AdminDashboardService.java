package com.ebanking.adminTool.service;

import com.ebanking.adminTool.dto.UserInfoDto;
import com.ebanking.adminTool.dto.response.DashboardStatsResponse;
import com.ebanking.adminTool.service.grpc.TransactionGrpcClient;
import com.ebanking.adminTool.service.grpc.UserGrpcClient;
import com.ebanking.adminTool.utils.AuditLogger;
import com.ebanking.transactionService.grpc.TransactionProto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminDashboardService {

    private final TransactionGrpcClient transactionGrpcClient;
    private final UserGrpcClient userGrpcClient;
    private final AuditLogger auditLogger;
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");

    public DashboardStatsResponse getDashboardStats(String adminUsername) {
        try {
            log.info("Admin {} fetching dashboard statistics", adminUsername);

            long totalUsers = 0L;
            long activeUsers = 0L;
            
            try {
                List<UserInfoDto> allUsers = userGrpcClient.getAllUsers();
                totalUsers = allUsers.size();
                activeUsers = totalUsers;
                log.info("Fetched {} users from UserService", totalUsers);
            } catch (Exception e) {
                log.warn("UserService unavailable, using fallback user count: {}", e.getMessage());
            }
            
            long totalTransactions = 0L;
            long totalTransactionsToday = 0L;
            long successfulTransactions = 0L;
            long failedTransactions = 0L;
            long pendingTransactions = 0L;
            BigDecimal totalAmount = BigDecimal.ZERO;
            BigDecimal totalAmountToday = BigDecimal.ZERO;
            List<DashboardStatsResponse.DailyCount> dailyTransactionCounts = new ArrayList<>();
            
            try {
                TransactionProto.TransactionList transactionList = 
                    transactionGrpcClient.getTransactionHistory(0, 10000, "", "", "", "", "");
                
                List<TransactionProto.TransferResponse> allTransactions = transactionList.getTransactionsList();
                totalTransactions = allTransactions.size();
                
                LocalDate today = LocalDate.now();
                String todayStr = today.format(DATE_FORMATTER);
                
                totalTransactionsToday = allTransactions.stream()
                    .filter(tx -> todayStr.equals(tx.getTransactionAt()))
                    .count();
                
                successfulTransactions = allTransactions.stream()
                    .filter(tx -> "SUCCESS".equalsIgnoreCase(tx.getStatus()))
                    .count();
                
                failedTransactions = allTransactions.stream()
                    .filter(tx -> "FAILED".equalsIgnoreCase(tx.getStatus()))
                    .count();
                
                pendingTransactions = allTransactions.stream()
                    .filter(tx -> "PENDING".equalsIgnoreCase(tx.getStatus()))
                    .count();
                
                totalAmount = allTransactions.stream()
                    .filter(tx -> "SUCCESS".equalsIgnoreCase(tx.getStatus()))
                    .map(tx -> new BigDecimal(tx.getAmount()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                totalAmountToday = allTransactions.stream()
                    .filter(tx -> "SUCCESS".equalsIgnoreCase(tx.getStatus()) && todayStr.equals(tx.getTransactionAt()))
                    .map(tx -> new BigDecimal(tx.getAmount()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                Map<String, Long> dailyCounts = allTransactions.stream()
                    .filter(tx -> tx.getTransactionAt() != null && !tx.getTransactionAt().isEmpty())
                    .collect(Collectors.groupingBy(
                        TransactionProto.TransferResponse::getTransactionAt,
                        Collectors.counting()
                    ));
                
                dailyTransactionCounts = dailyCounts.entrySet().stream()
                    .sorted(Map.Entry.<String, Long>comparingByKey().reversed())
                    .limit(7)
                    .map(entry -> DashboardStatsResponse.DailyCount.builder()
                        .date(entry.getKey())
                        .count(entry.getValue())
                        .build())
                    .collect(Collectors.toList());
                
                log.info("Fetched {} transactions from TransactionService", totalTransactions);
            } catch (Exception e) {
                log.warn("TransactionService unavailable, using fallback transaction stats: {}", e.getMessage());
            }
            
            DashboardStatsResponse response = DashboardStatsResponse.builder()
                    .totalUsers(totalUsers)
                    .totalAccounts(totalUsers)
                    .totalTransactions(totalTransactions)
                    .totalTransactionsToday(totalTransactionsToday)
                    .totalAmount(totalAmount.toString())
                    .totalAmountToday(totalAmountToday.toString())
                    .activeUsers(activeUsers)
                    .lockedAccounts(0L)
                    .failedTransactions(failedTransactions)
                    .pendingTransactions(pendingTransactions)
                    .successfulTransactions(successfulTransactions)
                    .suspiciousTransactions(0L)
                    .dailyTransactionCounts(dailyTransactionCounts)
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