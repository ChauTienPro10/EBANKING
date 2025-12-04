package com.ebanking.admintool.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Request DTO for locking user account
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LockUserRequest {

    /**
     * User ID to lock
     */
    private Long userId;

    /**
     * Reason for locking
     */
    private String reason;

    /**
     * When the lock expires (null for indefinite)
     */
    private LocalDateTime expiresAt;
}

