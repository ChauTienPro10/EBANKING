package com.ebanking.ekycservice.controller;

import com.ebanking.ekycservice.dto.request.FptAiWebhookRequest;
import com.ebanking.ekycservice.dto.response.ApiResponse;
import com.ebanking.ekycservice.dto.response.FptAiSdkConfigResponse;
import com.ebanking.ekycservice.service.FptAiSdkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller để tích hợp FPT AI eKYC Web SDK
 * Tham khảo: https://docs-vision.fpt.ai/ekyc/
 */
@RestController
@RequestMapping("/api/ekyc/sdk")
@RequiredArgsConstructor
@Slf4j
public class FptAiSdkController {

    private final FptAiSdkService fptAiSdkService;

    /**
     * Khởi tạo SDK config để frontend sử dụng
     * Frontend sẽ nhúng WebView với config này
     */
    @PostMapping("/init")
    public ResponseEntity<ApiResponse<FptAiSdkConfigResponse>> initSdk(
            @RequestParam String sessionId,
            @RequestParam(required = false, defaultValue = "vi") String language) {

        log.info("Initializing FPT AI SDK for session: {}", sessionId);

        FptAiSdkConfigResponse config = fptAiSdkService.initializeSdkConfig(sessionId, language);

        return ResponseEntity.ok(ApiResponse.success(config));
    }

    /**
     * Webhook/Callback endpoint để nhận kết quả từ FPT AI SDK
     * FPT AI sẽ gọi endpoint này khi hoàn thành OCR, Liveness, Face Match
     */
    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<String>> handleWebhook(
            @RequestBody FptAiWebhookRequest request,
            @RequestHeader(value = "X-Session-Token", required = false) String sessionToken) {

        log.info("Received webhook from FPT AI: sessionId={}, type={}, status={}",
                request.getSessionId(), request.getType(), request.getStatus());

        // Xác thực token
        if (sessionToken != null) {
            fptAiSdkService.validateSessionToken(request.getSessionId(), sessionToken);
        }

        // Xử lý webhook dựa trên type
        fptAiSdkService.handleWebhook(request);

        return ResponseEntity.ok(ApiResponse.success("Webhook processed successfully"));
    }

    /**
     * Alternative: Frontend callback endpoint
     * Frontend có thể gọi trực tiếp sau khi SDK hoàn thành
     */
    @PostMapping("/callback")
    public ResponseEntity<ApiResponse<String>> handleCallback(
            @RequestBody FptAiWebhookRequest request) {

        log.info("Received callback from frontend: sessionId={}, type={}, status={}",
                request.getSessionId(), request.getType(), request.getStatus());

        fptAiSdkService.handleWebhook(request);

        return ResponseEntity.ok(ApiResponse.success("Callback processed successfully"));
    }

    /**
     * Lấy trạng thái hiện tại của SDK flow
     */
    @GetMapping("/status/{sessionId}")
    public ResponseEntity<ApiResponse<String>> getSdkStatus(
            @PathVariable String sessionId) {

        log.info("Getting SDK status for session: {}", sessionId);

        String status = fptAiSdkService.getSdkStatus(sessionId);

        return ResponseEntity.ok(ApiResponse.success(status));
    }
}

