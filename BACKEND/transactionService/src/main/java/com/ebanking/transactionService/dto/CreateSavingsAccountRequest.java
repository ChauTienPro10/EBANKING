package com.ebanking.transactionService.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSavingsAccountRequest {
    private Long userId;
    private Long paymentAccountId;
    private BigDecimal initialAmount;
    private String currency;
    private Long interestRateId;
    private Integer termMonths;
}