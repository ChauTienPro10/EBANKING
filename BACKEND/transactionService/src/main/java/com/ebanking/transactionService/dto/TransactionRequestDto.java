package com.ebanking.transactionService.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionRequestDto {
    private Long requestId;
    private String requestNumber;
    private Long userId;
    private Long savingsAccountId;
    private String savingsAccountNumber;
    private String requestType;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String description;
    private String rejectionReason;
    private LocalDateTime requestedAt;
    private LocalDateTime processedAt;
    private String processedBy;
}