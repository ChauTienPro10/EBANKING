package com.ebanking.transactionService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TelecomProviderDto {
    private Long providerId;
    private String providerCode;
    private String providerName;
    private String logoUrl;
    private Boolean isActive;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private BigDecimal feePercentage;
    private BigDecimal fixedFee;
    private List<TopUpDenominationDto> denominations;
    
    public static TelecomProviderDto fromEntity(com.ebanking.transactionService.entity.TelecomProvider entity) {
        return TelecomProviderDto.builder()
                .providerId(entity.getProviderId())
                .providerCode(entity.getProviderCode())
                .providerName(entity.getProviderName())
                .logoUrl(entity.getLogoUrl())
                .isActive(entity.getIsActive())
                .minAmount(entity.getMinAmount())
                .maxAmount(entity.getMaxAmount())
                .feePercentage(entity.getFeePercentage())
                .fixedFee(entity.getFixedFee())
                .build();
    }
}