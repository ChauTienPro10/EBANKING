package com.ebanking.transactionService.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataTopUpResponse {
    private Long dataTopUpId;
    private String transactionId;
    private String phoneNumber;
    private String telecomProvider;
    private String packageName;
    private String formattedDataAmount;
    private Integer validityDays;
    private BigDecimal amount;
    private String currency;
    private String status;
    private String providerTransactionId;
    private String failureReason;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    
    // Face authentication fields
    private Boolean requiresFaceAuth;
    private String faceAuthSessionId;
    private Boolean faceAuthVerified;
}