package com.example.auth.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class TransferRequest {
    String username;
    String senderAccountNumber;
    String receiverAccountNumber;
    Long amount;
    String currency;
    String transactionType;
    String description;
}
