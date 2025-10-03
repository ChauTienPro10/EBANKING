package com.ebanking.emailService.dto;


import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
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

