package com.ebanking.transactionService.enums;

public enum TransactionType {
    TRANSFER,
    DEPOSIT,
    WITHDRAWAL,
    PAYMENT;

    public static TransactionType fromName(String name) {
        for (TransactionType type : TransactionType.values()) {
            if (type.name().equalsIgnoreCase(name)) {
                return type;
            }
        }
        throw new IllegalArgumentException("No enum constant with name " + name);
    }
}
