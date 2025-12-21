package com.ebanking.transactionService.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterestRateDto {
    private Long interestRateId;
    private Integer termMonths;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private BigDecimal annualRate;
    private String status;
    private LocalDateTime effectiveFrom;
    private LocalDateTime effectiveTo;
}