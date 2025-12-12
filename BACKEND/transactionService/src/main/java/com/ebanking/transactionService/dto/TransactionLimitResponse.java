package com.ebanking.transactionService.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionLimitResponse {
    private Long userId;
    private BigDecimal dailyLimit;
    private BigDecimal singleTransactionLimit;
    private BigDecimal usedAmount;
    private BigDecimal remainingAmount;
    private LocalDate limitDate;
    
    // System maximum limits
    private BigDecimal systemMaxDailyLimit;
    private BigDecimal systemMaxSingleLimit;
}
