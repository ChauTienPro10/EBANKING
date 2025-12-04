package com.ebanking.admintool.dto.request;

import com.ebanking.admintool.entity.TransactionFlag;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FlagTransactionRequest {
    private Long transactionId;
    private TransactionFlag.FlagType flagType; // SUSPICIOUS, FRAUD, REVIEW
    private String reason;
}

