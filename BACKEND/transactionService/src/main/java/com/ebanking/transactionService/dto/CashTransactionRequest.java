package com.ebanking.transactionService.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CashTransactionRequest {
    private Long userId;
    private Long savingsAccountId;
    private String requestType; // CASH_DEPOSIT, CASH_WITHDRAWAL
    private BigDecimal amount;
    private String currency;
    private String description;
}