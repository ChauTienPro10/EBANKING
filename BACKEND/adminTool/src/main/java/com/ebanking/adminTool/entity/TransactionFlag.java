package com.ebanking.admintool.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Transaction Flag Entity
 * Lưu các đánh dấu giao dịch đáng ngờ/gian lận và kết quả xử lý
 */
@Entity
@Table(name = "transaction_flags", indexes = {
        @Index(name = "idx_transaction_id", columnList = "transaction_id"),
        @Index(name = "idx_flag_type", columnList = "flag_type"),
        @Index(name = "idx_flagged_at", columnList = "flagged_at")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionFlag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id", nullable = false)
    private Long transactionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "flag_type", nullable = false, length = 20)
    private FlagType flagType;

    @Column(name = "flag_reason", columnDefinition = "TEXT")
    private String flagReason;

    @Column(name = "flagged_by", length = 100)
    private String flaggedBy;

    @Column(name = "flagged_at", nullable = false)
    private LocalDateTime flaggedAt;

    @Column(name = "resolved_by", length = 100)
    private String resolvedBy;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    public enum FlagType {
        SUSPICIOUS,
        FRAUD,
        REVIEW,
        APPROVED,
        REJECTED
    }
}

