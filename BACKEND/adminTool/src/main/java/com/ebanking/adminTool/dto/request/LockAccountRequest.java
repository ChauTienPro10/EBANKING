package com.ebanking.admintool.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LockAccountRequest {
    private Long accountId; // Optional if accountNumber provided
    private String accountNumber; // Optional if accountId provided
    private String reason;
    private LocalDateTime expiresAt;
}
