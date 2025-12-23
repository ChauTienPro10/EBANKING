package com.ebanking.adminTool.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequestDto {
    private Long requestId;
    private String requestNumber;
    private Long userId;
    private Long savingsAccountId;
    private String requestType; // CASH_DEPOSIT, CASH_WITHDRAWAL
    private BigDecimal amount;
    private String currency;
    private String status; // PENDING, APPROVED, REJECTED, COMPLETED
    private String description;
    private String rejectionReason;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime requestedAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime processedAt;
    
    private String processedBy;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;
    
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updatedAt;
}