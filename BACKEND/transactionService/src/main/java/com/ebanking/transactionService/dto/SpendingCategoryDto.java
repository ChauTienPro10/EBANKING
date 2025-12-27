package com.ebanking.transactionService.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpendingCategoryDto {
    private String id;
    private String name;
    private String code;
    private String icon;
    private String color;
    private Boolean isDefault;
}
