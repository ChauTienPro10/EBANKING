package com.ebanking.admintool.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateAccountLimitRequest {
    private Long accountId; // Optional if accountNumber provided
    private String accountNumber; // Optional if accountId provided
    private BigDecimal dailyLimit;
    private BigDecimal perTransactionLimit;
}
