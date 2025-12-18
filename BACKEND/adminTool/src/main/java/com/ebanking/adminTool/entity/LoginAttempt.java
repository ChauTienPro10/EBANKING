package com.ebanking.adminTool.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Login Attempt Entity
 * Tracks failed login attempts for rate limiting
 */
@Entity
@Table(name = "login_attempts")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", nullable = false, length = 100)
    private String username;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "attempt_count")
    @Builder.Default
    private Integer attemptCount = 1;

    @Column(name = "last_attempt")
    private LocalDateTime lastAttempt;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        lastAttempt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        lastAttempt = LocalDateTime.now();
    }
}
