package com.example.auth.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "LOCK_ACCOUNT")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LockAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username; // Tên đăng nhập của tài khoản bị khóa

    @Column(name = "user_id")
    private Long userId; // ID của user bị khóa (nếu có)

    @Column(name = "account_id")
    private Long accountId; // ID của account bị khóa (nếu có)

    @Column(nullable = false, length = 500)
    private String reason; // Lý do khóa

    @Column(name = "lock_type", nullable = false, length = 20)
    private String lockType; // Loại khóa: ADMIN_LOCK, SELF_LOCK

    @Column(name = "locked_at", nullable = false)
    private LocalDateTime lockedAt; // Thời gian khóa

    @Column(name = "locked_by", nullable = false)
    private String lockedBy; // Người thực hiện khóa (admin username)

    @Column(name = "unlocked_at")
    private LocalDateTime unlockedAt; // Thời gian mở khóa

    @Column(name = "unlocked_by")
    private String unlockedBy; // Người thực hiện mở khóa (admin username)

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true; // true = đang bị khóa, false = đã mở khóa

    @Column(length = 1000)
    private String notes; // Ghi chú thêm
}
