package com.ebanking.transactionService.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "data_package")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DataPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "package_id")
    private Long packageId;

    @Column(name = "provider_id", nullable = false)
    private Long providerId;

    @Column(name = "package_code", nullable = false, unique = true, length = 50)
    private String packageCode; // D10, D30, D50, etc.

    @Column(name = "package_name", nullable = false, length = 200)
    private String packageName; // "Gói 4G 10GB/tháng", etc.

    @Column(name = "data_amount", nullable = false)
    private Long dataAmount; // Data amount in MB

    @Column(name = "validity_days", nullable = false)
    private Integer validityDays; // Package validity in days

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal price;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "provider_id", insertable = false, updatable = false)
    private TelecomProvider provider;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper method to format data amount
    public String getFormattedDataAmount() {
        if (dataAmount >= 1024) {
            return (dataAmount / 1024) + "GB";
        }
        return dataAmount + "MB";
    }
}