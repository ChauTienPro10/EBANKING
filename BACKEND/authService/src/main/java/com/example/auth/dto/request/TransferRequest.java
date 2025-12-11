package com.example.auth.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransferRequest {
    String pin;
    String username;
    String senderAccountNumber;
    String receiverAccountNumber;
    Long amount;
    String currency;
    String transactionType;
    String description;
    // Face authentication fields
    Boolean requiresFaceAuth;
    String faceAuthSessionId;
}
