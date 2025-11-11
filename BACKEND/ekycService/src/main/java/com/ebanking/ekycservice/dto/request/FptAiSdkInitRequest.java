package com.ebanking.ekycservice.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO để khởi tạo FPT AI eKYC SDK configuration
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FptAiSdkInitRequest {

    /**
     * Session ID để tracking
     */
    private String sessionId;

    /**
     * User ID
     */
    private Long userId;

    /**
     * Callback URL để nhận kết quả từ FPT AI
     */
    private String callbackUrl;

    /**
     * Các tùy chọn khác (nếu cần)
     */
    private String language; // vi, en

    private Boolean enableOcr;

    private Boolean enableLiveness;

    private Boolean enableFaceMatch;
}

