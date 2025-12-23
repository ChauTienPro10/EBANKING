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
public class TopUpDenominationDto {
    private Long denominationId;
    private Long providerId;
    private BigDecimal amount;
    private String displayName;
    private Boolean isActive;
    private Integer sortOrder;
    
    public static TopUpDenominationDto fromEntity(com.ebanking.transactionService.entity.TopUpDenomination entity) {
        return TopUpDenominationDto.builder()
                .denominationId(entity.getDenominationId())
                .providerId(entity.getProviderId())
                .amount(entity.getAmount())
                .displayName(entity.getDisplayName())
                .isActive(entity.getIsActive())
                .sortOrder(entity.getSortOrder())
                .build();
    }
}