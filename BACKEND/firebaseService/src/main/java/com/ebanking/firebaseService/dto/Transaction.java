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
public class Transaction {

    private Long transactionId;

    String username;

    private String senderAccountNumber;

    private String receiverAccountNumber;

    private BigDecimal amount;

    private String currency;

    private String transactionType;

    private String status;

    private String description;

    private LocalDateTime transactionAt;

}
