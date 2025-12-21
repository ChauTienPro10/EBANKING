package com.ebanking.transactionService.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "savings_account")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavingsAccount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "savings_account_id")
    private Long savingsAccountId;

    @Column(name = "account_number", nullable = false, unique = true)
    private String accountNumber;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "payment_account_id", nullable = false)
    private Long paymentAccountId; // Liên kết với tài khoản thanh toán

    @Column(nullable = false)
    private BigDecimal balance;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "interest_rate_id", nullable = false)
    private Long interestRateId; // Liên kết với bảng lãi suất

    @Column(name = "term_months", nullable = false)
    private Integer termMonths; // Kỳ hạn (tháng)

    @Column(nullable = false)
    private String status; // ACTIVE, CLOSED, MATURED

    @Column(name = "opened_date", nullable = false)
    private LocalDateTime openedDate;

    @Column(name = "maturity_date", nullable = false)
    private LocalDateTime maturityDate;

    @Column(name = "closed_date")
    private LocalDateTime closedDate;

    @Column(name = "last_interest_calculated_at")
    private LocalDateTime lastInterestCalculatedAt;

    @Column(name = "total_interest_earned")
    private BigDecimal totalInterestEarned = BigDecimal.ZERO;

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