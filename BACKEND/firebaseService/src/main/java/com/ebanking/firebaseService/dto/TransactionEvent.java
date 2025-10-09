package com.ebanking.firebaseService.dto;

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
public class TransactionEvent {
    private Long transactionId;
    private String username;
    private String senderAccountNumber;
    private String receiverAccountNumber;
    private BigDecimal amount;
    private String currency;
    private String transactionType;
    private String status; // PENDING, SUCCESS, FAILED
    private String description;
    private String failureReason;
    private LocalDateTime transactionAt;
}
