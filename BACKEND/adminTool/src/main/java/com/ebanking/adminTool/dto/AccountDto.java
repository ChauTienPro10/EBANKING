package com.ebanking.adminTool.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountDto {
    private Long accountId;
    private String accountNumber;
    private String accountType;
    private BigDecimal balance;
    private String currency;
    private String status;
    private LocalDateTime openedDate;
    private LocalDateTime closedDate;
    private Boolean isPrimary;
    private Long userId;
    private String userFullName; // Added user full name
    private LocalDateTime lastTransactionAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Lock status information
    private Boolean isLocked; // true if account is locked, false otherwise
    private String lockType; // ADMIN_LOCK, SELF_LOCK
    private String lockReason; // Reason for locking
    private LocalDateTime lockedAt; // When the account was locked
    private String lockedBy; // Who locked the account
    private LocalDateTime unlockedAt; // When the account was unlocked (if applicable)
    private String unlockedBy; // Who unlocked the account (if applicable)
    private String lockNotes; // Additional notes about the lock
}