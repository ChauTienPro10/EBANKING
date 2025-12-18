package com.ebanking.adminTool.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Audit Log Entity
 * Records all admin actions for security and compliance
 */
@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_staff_username", columnList = "staff_username"),
        @Index(name = "idx_timestamp", columnList = "timestamp"),
        @Index(name = "idx_action", columnList = "action"),
        @Index(name = "idx_target", columnList = "target_type, target_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "staff_username", nullable = false, length = 100)
    private String staffUsername;

    @Column(name = "action", nullable = false, length = 100)
    private String action;

    @Column(name = "target_type", length = 50)
    private String targetType;

    @Column(name = "target_id", length = 100)
    private String targetId;

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;

    @Column(name = "success", nullable = false)
    private boolean success;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;
}

