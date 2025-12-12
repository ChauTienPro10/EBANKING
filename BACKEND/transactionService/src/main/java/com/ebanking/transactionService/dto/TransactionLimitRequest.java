package com.ebanking.transactionService.dto;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionLimitRequest {
    private Long userId;
    private BigDecimal dailyLimit;
    private BigDecimal singleTransactionLimit;
}
