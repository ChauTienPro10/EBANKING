package com.banking.userService.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EkycVerificationRequest {

    @NotNull(message = "Session ID is required")
    private UUID sessionId;

    /**
     * API key from EkycService for authentication
     * In production, use JWT or mutual TLS
     */
    private String apiKey;
}
