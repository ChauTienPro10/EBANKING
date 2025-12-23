package com.ebanking.adminTool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequestFilterDto {
    // Pagination
    private int page = 0;
    private int size = 20;
    
    // Date filters
    private LocalDate fromDate;
    private LocalDate toDate;
    
    // Status filter
    private String status;
    
    // Request number filter
    private String requestNumber;
    
    // Amount range filters
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    
    // Additional filters
    private String requestType; // CASH_DEPOSIT, CASH_WITHDRAWAL
    private Long userId;
    private Long savingsAccountId;
    private String processedBy;
    
    // Sorting
    private String sortBy = "created_at";
    private String sortDirection = "DESC";
}