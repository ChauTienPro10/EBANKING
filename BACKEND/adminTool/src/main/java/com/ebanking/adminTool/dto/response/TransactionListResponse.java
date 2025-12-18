package com.ebanking.adminTool.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Transaction List Response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionListResponse {
    private List<TransactionInfo> transactions;
    private int totalCount;
    private int page;
    private int limit;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransactionInfo {
        private Long transactionId;
        private String senderAccountNumber;
        private String receiverAccountNumber;
        private String amount;
        private String currency;
        private String transactionType;
        private String description;
        private String status;
        private String transactionAt;
    }
}

