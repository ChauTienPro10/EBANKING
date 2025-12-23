package com.ebanking.transactionService.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataPackageDto {
    private Long packageId;
    private Long providerId;
    private String providerCode;
    private String providerName;
    private String packageCode;
    private String packageName;
    private Long dataAmount; // in MB
    private String formattedDataAmount; // "10GB", "500MB"
    private Integer validityDays;
    private BigDecimal price;
    private String description;
    private Boolean isActive;
    private Integer sortOrder;
}