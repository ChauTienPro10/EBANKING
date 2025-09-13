package com.ebanking.transactionService.enums;

public enum AccountType {
    SAVINGS,
    CHECKING,
    CREDIT,
    LOAN,
    INVESTMENT;

    public static AccountType fromName(String name) {
        if (name == null) {
            return null; // hoặc throw IllegalArgumentException
        }
        try {
            return AccountType.valueOf(name.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null; // hoặc throw exception tùy bạn xử lý
        }
    }
}

