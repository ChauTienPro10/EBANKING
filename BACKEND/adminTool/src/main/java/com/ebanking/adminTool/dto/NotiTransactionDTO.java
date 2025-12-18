package com.ebanking.adminTool.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotiTransactionDTO {
    private Long id;
    private String username;
    private String transactionType;
    private BigDecimal amount;
    private String content;
    private LocalDateTime createdAt;
}
