package com.example.auth.dto;

import com.example.auth.entity.LockAccount;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LockAccountResponse {
    private Long id;
    private String username;
    private Long userId;
    private Long accountId;
    private String reason;
    private String lockType; // Loại khóa: ADMIN_LOCK, SELF_LOCK
    private LocalDateTime lockedAt;
    private String lockedBy;
    private LocalDateTime unlockedAt;
    private String unlockedBy;
    private Boolean isActive;
    private String notes;
    private String message; // Thông báo kết quả

    // Phương thức chuyển đổi từ Entity sang Response
    public static LockAccountResponse fromEntity(LockAccount lockAccount, String message) {
        return LockAccountResponse.builder()
                .id(lockAccount.getId())
                .username(lockAccount.getUsername())
                .userId(lockAccount.getUserId())
                .accountId(lockAccount.getAccountId())
                .reason(lockAccount.getReason())
                .lockType(lockAccount.getLockType())
                .lockedAt(lockAccount.getLockedAt())
                .lockedBy(lockAccount.getLockedBy())
                .unlockedAt(lockAccount.getUnlockedAt())
                .unlockedBy(lockAccount.getUnlockedBy())
                .isActive(lockAccount.getIsActive())
                .notes(lockAccount.getNotes())
                .message(message)
                .build();
    }
}
