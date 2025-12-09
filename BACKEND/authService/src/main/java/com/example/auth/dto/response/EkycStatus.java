package com.example.auth.dto.response;

public enum EkycStatus {
    INITIATED("Khởi tạo"),
    OCR_COMPLETED("Hoàn thành OCR"),
    LIVENESS_COMPLETED("Hoàn thành Liveness"),
    FACE_MATCHED("Khớp khuôn mặt"),
    COMPLETED("Hoàn thành"),
    FAILED("Thất bại");

    private final String description;

    EkycStatus(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
