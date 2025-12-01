package com.ebanking.firebaseService.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Account {
    private Long accountId;

    private String accountNumber;

    private String accountType;

    private BigDecimal balance;

    private String currency;

    private String status;

    private LocalDateTime openedDate;

    private LocalDateTime closedDate;

    private Boolean isPrimary;

    private Long userId;

    private LocalDateTime lastTransactionAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
