package com.ebanking.transactionService.enums;

public enum TransactionStatus {
    PENDING,        // Giao dịch đang chờ xử lý
    SUCCESS,        // Giao dịch thành công
    FAILED,         // Giao dịch thất bại
    CANCELLED;       // Giao dịch bị hủy

    public static TransactionStatus fromName(String name) {
        for (TransactionStatus status : TransactionStatus.values()) {
            if (status.name().equalsIgnoreCase(name)) {
                return status;
            }
        }
        throw new IllegalArgumentException("No enum constant with name " + name);
    }
}