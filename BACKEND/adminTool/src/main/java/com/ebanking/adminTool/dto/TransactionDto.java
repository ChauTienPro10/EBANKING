package com.ebanking.adminTool.dto;

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
public class TransactionDto {
    private Long transactionId;
    private String username;
    private String senderAccountNumber;
    private String senderFullName;
    private String receiverAccountNumber;
    private String receiverFullName;
    private BigDecimal amount;
    private String currency;
    private String transactionType;
    private String status;
    private String description;
    private String failureReason;
    private LocalDateTime transactionAt;
    private Boolean requiresFaceAuth;
    private String faceAuthSessionId;
    private Boolean faceAuthVerified;
    private LocalDateTime faceAuthAt;
}