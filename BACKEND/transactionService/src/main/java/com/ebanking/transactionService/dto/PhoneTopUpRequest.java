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
public class PhoneTopUpRequest {
    private Long userId;
    private String username;
    private String accountNumber;
    private String phoneNumber;
    private String telecomProvider;
    private BigDecimal amount;
    private String pin; // PIN code for authentication
    
    // Face authentication fields
    private Boolean requiresFaceAuth;
    private String faceAuthSessionId;
}