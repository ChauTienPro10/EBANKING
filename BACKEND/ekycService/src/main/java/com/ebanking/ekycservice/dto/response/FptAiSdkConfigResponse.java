package com.ebanking.ekycservice.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response chứa config để khởi tạo FPT AI eKYC SDK ở frontend
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FptAiSdkConfigResponse {

    /**
     * Session ID
     */
    private String sessionId;

    /**
     * API Key để khởi tạo SDK
     */
    private String apiKey;

    /**
     * Base URL của FPT AI
     */
    private String baseUrl;

    /**
     * Callback URL để SDK gửi kết quả về
     */
    private String callbackUrl;

    /**
     * Token để authenticate callback
     */
    private String sessionToken;

    /**
     * Cấu hình các bước cần thực hiện
     */
    private SdkStepsConfig steps;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SdkStepsConfig {
        private Boolean ocrEnabled;
        private Boolean livenessEnabled;
        private Boolean faceMatchEnabled;
    }
}

