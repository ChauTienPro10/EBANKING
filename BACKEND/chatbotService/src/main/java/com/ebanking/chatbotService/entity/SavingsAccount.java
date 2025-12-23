package com.ebanking.chatbotService.entity;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavingsAccount {
    
    private Long savingsAccountId;
    private String accountNumber;
    private Long userId;
    private Long paymentAccountId; // Liên kết với tài khoản thanh toán
    private BigDecimal balance;
    private String currency;
    private Long interestRateId; // Liên kết với bảng lãi suất
    private Integer termMonths; // Kỳ hạn (tháng)
    private String status; // ACTIVE, CLOSED, MATURED
    private LocalDateTime openedDate;
    private LocalDateTime maturityDate;
    private LocalDateTime closedDate;
    private LocalDateTime lastInterestCalculatedAt;
    private BigDecimal totalInterestEarned;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}