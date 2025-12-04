package com.ebanking.admintool.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FreezeAccountRequest {
    private Long accountId; // Optional if accountNumber provided
    private String accountNumber; // Optional if accountId provided
    private String reason;
}
