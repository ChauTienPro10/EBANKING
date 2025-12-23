package com.ebanking.transactionService.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferContentParseResult {
    private String purposeCode;
    private String content;
    private boolean hasPurpose;
}