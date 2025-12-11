package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.dto.response.*;
import com.example.auth.services.EkycService;
import com.example.auth.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping(IURL.EKYC_URL) // "/authService/ekyc"
@RequiredArgsConstructor
@Slf4j
public class EkycController {

    private final EkycService ekycService;
    private final SecurityUtils securityUtils;

    /**
     * Create eKYC session for authenticated user
     */
    @PostMapping("/sessions")
    public ResponseEntity<ApiResponse<SessionResponse>> createSession(
            @RequestHeader Map<String, String> headers) {
        
        Long userId = securityUtils.extractUserIdFromHeaders(headers);
        
        log.info("POST::: /ekyc/sessions for user {}", userId);
        return ekycService.createSession(userId);
    }

    /**
     * Get eKYC session
     */
    @GetMapping("/sessions/{sessionId}")
    public ResponseEntity<ApiResponse<SessionResponse>> getSession(
            @PathVariable String sessionId,
            @RequestHeader Map<String, String> headers) {
        
        Long userId = securityUtils.extractUserIdFromHeaders(headers);
        
        log.info("GET::: /ekyc/sessions/{} for user {}", sessionId, userId);
        return ekycService.getSession(sessionId, userId);
    }

    /**
     * Process OCR
     */
    @PostMapping(value = "/ocr", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<OrcResponse>> processOcr(
            @RequestParam("sessionId") String sessionId,
            @RequestParam("frontImage") MultipartFile frontImage,
            @RequestParam("backImage") MultipartFile backImage,
            @RequestHeader Map<String, String> headers) {
        
        Long userId = securityUtils.extractUserIdFromHeaders(headers);
        
        log.info("POST::: /ekyc/ocr for session {} user {}", sessionId, userId);
        return ekycService.processOcr(sessionId, frontImage, backImage, userId);
    }

    /**
     * Process liveness
     */
    @PostMapping(value = "/liveness", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<LivenessResponse>> processLiveness(
            @RequestParam("sessionId") String sessionId,
            @RequestParam("video") MultipartFile video,
            @RequestHeader Map<String, String> headers) {
        
        Long userId = securityUtils.extractUserIdFromHeaders(headers);
        
        log.info("POST::: /ekyc/liveness for session {} user {}", sessionId, userId);
        return ekycService.processLiveness(sessionId, video, userId);
    }

    /**
     * Process face match
     */
    @PostMapping("/face-match")
    public ResponseEntity<ApiResponse<FaceMatchResponse>> processFaceMatch(
            @RequestParam String sessionId,
            @RequestHeader Map<String, String> headers) {
        
        Long userId = securityUtils.extractUserIdFromHeaders(headers);
        
        log.info("POST::: /ekyc/face-match for session {} user {}", sessionId, userId);
        return ekycService.processFaceMatch(sessionId, userId);
    }

    /**
     * Get session details
     */
    @GetMapping("/sessions/{sessionId}/details")
    public ResponseEntity<ApiResponse<EkycDetailResponse>> getSessionDetails(
            @PathVariable String sessionId,
            @RequestHeader Map<String, String> headers) {
        
        Long userId = securityUtils.extractUserIdFromHeaders(headers);
        
        log.info("GET::: /ekyc/sessions/{}/details for user {}", sessionId, userId);
        return ekycService.getSessionDetails(sessionId, userId);
    }

    /**
     * Check if face authentication is required for transaction
     * Proxies to transactionService
     */
    @PostMapping("/check-face-auth")
    public ResponseEntity<?> checkFaceAuthRequired(
            @RequestParam Long userId,
            @RequestParam String username,
            @RequestParam String amount,
            @RequestHeader Map<String, String> headers) {
        
        log.info("POST::: /ekyc/check-face-auth for user {} amount {}", username, amount);
        return ekycService.checkFaceAuthRequired(userId, username, amount);
    }

    /**
     * Verify face authentication for transaction
     * Proxies to ekycService
     */
    @PostMapping(value = "/verify-transaction", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> verifyTransactionFaceAuth(
            @RequestParam Long userId,
            @RequestParam String sessionId,
            @RequestParam("video") MultipartFile video,
            @RequestHeader Map<String, String> headers) {
        
        log.info("POST::: /ekyc/verify-transaction for user {}, sessionId: {}", userId, sessionId);
        return ekycService.verifyTransactionFaceAuth(userId, sessionId, video);
    }
}
