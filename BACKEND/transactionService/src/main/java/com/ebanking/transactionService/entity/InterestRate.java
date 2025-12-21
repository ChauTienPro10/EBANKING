package com.ebanking.transactionService.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "interest_rate")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterestRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interest_rate_id")
    private Long interestRateId;

    @Column(name = "term_months", nullable = false)
    private Integer termMonths; // Kỳ hạn (tháng)

    @Column(name = "min_amount", nullable = false)
    private BigDecimal minAmount; // Số tiền tối thiểu

    @Column(name = "max_amount")
    private BigDecimal maxAmount; // Số tiền tối đa (null = không giới hạn)

    @Column(name = "annual_rate", nullable = false, precision = 5, scale = 4)
    private BigDecimal annualRate; // Lãi suất năm (ví dụ: 0.0650 = 6.5%)

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE

    @Column(name = "effective_from", nullable = false)
    private LocalDateTime effectiveFrom;

    @Column(name = "effective_to")
    private LocalDateTime effectiveTo;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}