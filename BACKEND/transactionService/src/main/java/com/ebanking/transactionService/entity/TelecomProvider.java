package com.ebanking.transactionService.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "telecom_provider")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TelecomProvider {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "provider_id")
    private Long providerId;

    @Column(name = "provider_code", nullable = false, unique = true, length = 20)
    private String providerCode; // VIETTEL, MOBIFONE, VINAPHONE, VIETNAMOBILE

    @Column(name = "provider_name", nullable = false, length = 100)
    private String providerName; // Display name

    @Column(name = "logo_url", length = 500)
    private String logoUrl;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "api_endpoint", length = 500)
    private String apiEndpoint; // Provider API endpoint

    @Column(name = "api_key", length = 200)
    private String apiKey;

    @Column(name = "min_amount", precision = 19, scale = 2)
    private BigDecimal minAmount;

    @Column(name = "max_amount", precision = 19, scale = 2)
    private BigDecimal maxAmount;

    @Column(name = "fee_percentage", precision = 5, scale = 4)
    @Builder.Default
    private BigDecimal feePercentage = BigDecimal.ZERO;

    @Column(name = "fixed_fee", precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal fixedFee = BigDecimal.ZERO;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "providerId", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TopUpDenomination> denominations;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}