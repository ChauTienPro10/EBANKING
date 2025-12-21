package com.ebanking.transactionService.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferRequest {
    private Long userId;
    private String fromAccountNumber;
    private String toAccountNumber;
    private BigDecimal amount;
    private String currency;
    private String description;
    private String transferType; // PAYMENT_TO_SAVINGS, SAVINGS_TO_PAYMENT
}