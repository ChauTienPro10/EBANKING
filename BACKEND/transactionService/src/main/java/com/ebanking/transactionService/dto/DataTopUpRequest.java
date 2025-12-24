package com.ebanking.transactionService.dto;

import lombok.*;

import jakarta.validation.constraints.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataTopUpRequest {
    
    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^(\\+84|84|0)[3|5|7|8|9][0-9]{8}$", message = "Invalid Vietnamese phone number format")
    private String phoneNumber;
    
    @NotNull(message = "Package ID is required")
    @Positive(message = "Package ID must be positive")
    private Long packageId;
    
    @NotBlank(message = "Account number is required")
    private String accountNumber;
    
    private String pin; // Transaction PIN for verification
    
    private Boolean requiresFaceAuth = false;
    
    private String faceAuthSessionId; // For face authentication flow
}