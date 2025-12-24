package com.ebanking.transactionService.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "data_top_up")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataTopUp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "data_top_up_id")
    private Long dataTopUpId;

    @Column(name = "transaction_id", nullable = false, unique = true)
    private String transactionId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(nullable = false)
    private String username;

    @Column(name = "account_number", nullable = false)
    private String accountNumber;

    @Column(name = "phone_number", nullable = false, length = 15)
    private String phoneNumber;

    @Column(name = "package_id", nullable = false)
    private Long packageId;

    @Column(name = "telecom_provider", nullable = false, length = 50)
    private String telecomProvider;

    @Column(name = "package_name", nullable = false, length = 200)
    private String packageName;

    @Column(name = "data_amount", nullable = false)
    private Long dataAmount; // in MB

    @Column(name = "validity_days", nullable = false)
    private Integer validityDays;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false, length = 20)
    private String status; // PENDING, PROCESSING, COMPLETED, FAILED

    @Column(name = "provider_transaction_id", length = 100)
    private String providerTransactionId;

    @Column(name = "provider_response", columnDefinition = "TEXT")
    private String providerResponse;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    // Face authentication fields
    @Column(name = "requires_face_auth")
    private Boolean requiresFaceAuth = false;

    @Column(name = "face_auth_session_id", length = 36)
    private String faceAuthSessionId;

    @Column(name = "face_auth_verified")
    private Boolean faceAuthVerified = false;

    @Column(name = "face_auth_at")
    private LocalDateTime faceAuthAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "package_id", insertable = false, updatable = false)
    private DataPackage dataPackage;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) {
            status = "PENDING";
        }
        if (currency == null) {
            currency = "VND";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        if ("COMPLETED".equals(status) && completedAt == null) {
            completedAt = LocalDateTime.now();
        }
    }

    // Helper method to format data amount
    public String getFormattedDataAmount() {
        if (dataAmount >= 1024) {
            return (dataAmount / 1024) + "GB";
        }
        return dataAmount + "MB";
    }
}