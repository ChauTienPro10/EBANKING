package com.example.auth.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AccountResponse {
    private Long accountId;
    private String accountNumber;
    private String accountType;
    private BigDecimal balance;
    private String currency;
    private String status;
    private String openedDate;
    private String createdAt;
}
