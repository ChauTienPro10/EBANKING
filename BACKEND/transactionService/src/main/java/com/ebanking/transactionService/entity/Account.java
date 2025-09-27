package com.ebanking.transactionService.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "account")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long accountId;

    @Column(nullable = false, unique = true)
    private String accountNumber;

    @Column(nullable = false)
    private String accountType;

    @Column(nullable = false)
    private BigDecimal balance;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private LocalDateTime openedDate;

    private LocalDateTime closedDate;

    private Boolean isPrimary;

    @Column(nullable = false)
    private Long userId;

    private LocalDateTime lastTransactionAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
