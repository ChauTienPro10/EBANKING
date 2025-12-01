package com.ebanking.transactionService.dto;


import com.ebanking.transactionService.entity.Account;
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
public class AccounDto {
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

    private  String username;

    private LocalDateTime lastTransactionAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public static AccounDto fromAccount(Account account) {
        if (account == null) {
            return null;
        }

        AccounDto dto = new AccounDto();

        dto.setAccountId(account.getAccountId());
        dto.setAccountNumber(account.getAccountNumber());
        dto.setAccountType(account.getAccountType());
        dto.setBalance(account.getBalance());
        dto.setCurrency(account.getCurrency());
        dto.setStatus(account.getStatus());
        dto.setOpenedDate(account.getOpenedDate());
        dto.setClosedDate(account.getClosedDate());
        dto.setIsPrimary(account.getIsPrimary());
        dto.setUserId(account.getUserId());
        dto.setLastTransactionAt(account.getLastTransactionAt());
        dto.setCreatedAt(account.getCreatedAt());
        dto.setUpdatedAt(account.getUpdatedAt());

        return dto;
    }
}
