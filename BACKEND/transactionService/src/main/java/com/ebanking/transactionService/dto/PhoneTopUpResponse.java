package com.ebanking.transactionService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhoneTopUpResponse {
    private Long topUpId;
    private String transactionId;
    private String phoneNumber;
    private String telecomProvider;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String providerTransactionId;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    
    // Face authentication info
    private Boolean requiresFaceAuth;
    private String faceAuthSessionId;
    private Boolean faceAuthVerified;
    
    public static PhoneTopUpResponse fromEntity(com.ebanking.transactionService.entity.PhoneTopUp entity) {
        return PhoneTopUpResponse.builder()
                .topUpId(entity.getTopUpId())
                .transactionId(entity.getTransactionId())
                .phoneNumber(entity.getPhoneNumber())
                .telecomProvider(entity.getTelecomProvider())
                .amount(entity.getAmount())
                .currency(entity.getCurrency())
                .status(entity.getStatus())
                .providerTransactionId(entity.getProviderTransactionId())
                .failureReason(entity.getFailureReason())
                .createdAt(entity.getCreatedAt())
                .completedAt(entity.getCompletedAt())
                .requiresFaceAuth(entity.getRequiresFaceAuth())
                .faceAuthSessionId(entity.getFaceAuthSessionId())
                .faceAuthVerified(entity.getFaceAuthVerified())
                .build();
    }
}