package com.ebanking.transactionService.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavingsAccountDto {
    private Long savingsAccountId;
    private String accountNumber;
    private Long userId;
    private Long paymentAccountId;
    private String paymentAccountNumber;
    private BigDecimal balance;
    private String currency;
    private Long interestRateId;
    private BigDecimal annualRate;
    private Integer termMonths;
    private String status;
    private LocalDateTime openedDate;
    private LocalDateTime maturityDate;
    private LocalDateTime closedDate;
    private BigDecimal totalInterestEarned;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}