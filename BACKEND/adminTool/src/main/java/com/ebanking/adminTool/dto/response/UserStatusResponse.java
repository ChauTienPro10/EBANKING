package com.ebanking.admintool.dto.response;

import com.ebanking.admintool.entity.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for User Status
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusResponse {

    /**
     * User ID
     */
    private Long userId;

    /**
     * Username
     */
    private String username;

    /**
     * Current status (ACTIVE, LOCKED, BANNED, SUSPENDED)
     */
    private String status;

    /**
     * Reason for current status
     */
    private String statusReason;

    /**
     * Admin who locked/banned the user
     */
    private String lockedBy;

    /**
     * When the user was locked/banned
     */
    private LocalDateTime lockedAt;

    /**
     * When the lock expires (null for permanent ban)
     */
    private LocalDateTime lockExpiresAt;

    /**
     * When the record was created
     */
    private LocalDateTime createdAt;

    /**
     * When the record was last updated
     */
    private LocalDateTime updatedAt;

    /**
     * Convert UserStatus entity to response DTO
     */
    public static UserStatusResponse fromEntity(UserStatus userStatus) {
        return UserStatusResponse.builder()
                .userId(userStatus.getUserId())
                .username(userStatus.getUsername())
                .status(userStatus.getStatus().toString())
                .statusReason(userStatus.getStatusReason())
                .lockedBy(userStatus.getLockedBy())
                .lockedAt(userStatus.getLockedAt())
                .lockExpiresAt(userStatus.getLockExpiresAt())
                .createdAt(userStatus.getCreatedAt())
                .updatedAt(userStatus.getUpdatedAt())
                .build();
    }
}

