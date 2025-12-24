package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.services.AuthenticationService;
import com.example.auth.utils.HttpUltils;
import com.example.auth.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.websocket.AuthenticationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping(IURL.HOST_PREFIX + "/phone-topup")
@Slf4j
public class PhoneTopUpController {

    @Autowired
    private HttpUltils httpUtils;

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private SecurityUtils securityUtils;

    @Value("${service.trans.url:http://localhost:8003}")
    private String transactionServiceUrl;

    /**
     * Process phone top-up
     * POST /authService/phone-topup
     */
    @PostMapping
    public ResponseEntity<?> processTopUp(
            @RequestHeader Map<String, String> headers,
            @RequestBody Map<String, Object> request) {
        try {
            String username = (String) request.get("username");
            
            if (!securityUtils.checkUser(headers, username)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            log.info("Processing phone top-up for user: {}", username);

            String url = transactionServiceUrl + "/api/phone-topup";
            Object response = httpUtils.post(url, request, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing phone top-up: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Top-up failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get user's top-up history
     * GET /authService/phone-topup/history/{userId}
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getUserTopUpHistory(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            String jwt = authHeader.replace("Bearer ", "").trim();
            
            if (!authenticationService.checkValidUser(jwt, userId)) {
                throw new AuthenticationException("Bạn không có quyền thao tác");
            }

            log.info("Getting top-up history for user: {}", userId);

            String url = transactionServiceUrl + "/api/phone-topup/history/" + userId + 
                        "?page=" + page + "&size=" + size;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error getting top-up history: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get history");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get top-up by transaction ID
     * GET /authService/phone-topup/transaction/{transactionId}
     */
    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<?> getTopUpByTransactionId(
            @RequestHeader Map<String, String> headers,
            @PathVariable String transactionId) {
        try {
            log.info("Getting top-up by transaction ID: {}", transactionId);

            String url = transactionServiceUrl + "/api/phone-topup/transaction/" + transactionId;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting top-up: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get top-up");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Verify face authentication for top-up
     * POST /authService/phone-topup/verify-face-auth/{faceAuthSessionId}
     */
    @PostMapping("/verify-face-auth/{faceAuthSessionId}")
    public ResponseEntity<?> verifyFaceAuth(
            @RequestHeader Map<String, String> headers,
            @PathVariable String faceAuthSessionId) {
        try {
            log.info("Verifying face auth for session: {}", faceAuthSessionId);

            String url = transactionServiceUrl + "/api/phone-topup/verify-face-auth/" + faceAuthSessionId;
            Object response = httpUtils.post(url, null, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error verifying face auth: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Face auth verification failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get active telecom providers
     * GET /authService/phone-topup/providers
     */
    @GetMapping("/providers")
    public ResponseEntity<?> getActiveProviders() {
        try {
            log.info("Getting active telecom providers");

            String url = transactionServiceUrl + "/api/phone-topup/providers";
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting providers: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get providers");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get provider by code
     * GET /authService/phone-topup/providers/{providerCode}
     */
    @GetMapping("/providers/{providerCode}")
    public ResponseEntity<?> getProviderByCode(@PathVariable String providerCode) {
        try {
            log.info("Getting provider by code: {}", providerCode);

            String url = transactionServiceUrl + "/api/phone-topup/providers/" + providerCode;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting provider: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get provider");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get denominations by provider
     * GET /authService/phone-topup/providers/{providerId}/denominations
     */
    @GetMapping("/providers/{providerId}/denominations")
    public ResponseEntity<?> getDenominationsByProvider(@PathVariable Long providerId) {
        try {
            log.info("Getting denominations for provider: {}", providerId);

            String url = transactionServiceUrl + "/api/phone-topup/providers/" + providerId + "/denominations";
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting denominations: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get denominations");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get all active denominations
     * GET /authService/phone-topup/denominations
     */
    @GetMapping("/denominations")
    public ResponseEntity<?> getAllActiveDenominations() {
        try {
            log.info("Getting all active denominations");

            String url = transactionServiceUrl + "/api/phone-topup/denominations";
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting denominations: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get denominations");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}