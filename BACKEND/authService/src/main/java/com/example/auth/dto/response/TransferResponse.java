package com.example.auth.dto.response;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class TransferResponse {
    Long transactionId;
    String senderAccountNumber;
    String receiverAccountNumber;
    BigDecimal amount;
    String currency;
    String transactionType;
    String description;
    String status;
    String transactionAt;
}
