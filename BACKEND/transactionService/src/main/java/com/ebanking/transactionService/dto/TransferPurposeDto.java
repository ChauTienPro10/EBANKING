package com.ebanking.transactionService.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferPurposeDto {
    private String id;
    private String name;
    private String code;
    private String icon;
}