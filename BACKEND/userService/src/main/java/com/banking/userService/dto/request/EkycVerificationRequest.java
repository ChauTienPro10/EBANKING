package com.banking.userService.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EkycVerificationRequest {

    @NotNull(message = "Session ID is required")
    private UUID sessionId;

    /**
     * API key from EkycService for authentication
     * In production, use JWT or mutual TLS
     */
    private String apiKey;

    // ============ OCR Data from CCCD (NEW) ============
    /**
     * Data extracted from citizen ID card
     * Used to update UserInfo with accurate information
     */
    private String idNumber; // Số CCCD
    private String fullName; // Họ tên
    private LocalDate dateOfBirth; // Ngày sinh
    private String gender; // Giới tính
    private String address; // Địa chỉ
}
