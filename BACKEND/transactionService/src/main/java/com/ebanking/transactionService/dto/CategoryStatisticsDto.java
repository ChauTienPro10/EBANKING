package com.ebanking.transactionService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryStatisticsDto {
    private String categoryId;
    private String categoryName;
    private String categoryCode;
    private String categoryIcon;
    private String categoryColor;
    private BigDecimal totalAmount;
    private Long transactionCount;
    private Double percentage;
}
