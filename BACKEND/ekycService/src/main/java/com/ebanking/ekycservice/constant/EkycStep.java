package com.ebanking.ekycservice.constant;

public enum EkycStep {
    OCR(1, "Quét CCCD"),
    VERIFICATION(2, "Kiểm tra thông tin"),
    LIVENESS(3, "Xác thực khuôn mặt"),
    FACE_MATCH(4, "So khớp"),
    COMPLETED(5, "Hoàn thành");

    private final int order;
    private final String description;

    EkycStep(int order, String description) {
        this.order = order;
        this.description = description;
    }

    public int getOrder() {
        return order;
    }

    public String getDescription() {
        return description;
    }
}
