package com.ebanking.transactionService.controller;

import com.ebanking.transactionService.dto.*;
import com.ebanking.transactionService.service.PhoneTopUpService;
import com.ebanking.transactionService.service.TelecomProviderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/phone-topup")
@RequiredArgsConstructor
@Slf4j
public class PhoneTopUpController {

    private final PhoneTopUpService phoneTopUpService;
    private final TelecomProviderService telecomProviderService;

    /**
     * Process phone top-up
     * POST /api/phone-topup
     */
    @PostMapping
    public ResponseEntity<?> processTopUp(@RequestBody PhoneTopUpRequest request) {
        try {
            log.info("Processing phone top-up request for user: {}, phone: {}", 
                    request.getUsername(), request.getPhoneNumber());
            
            PhoneTopUpResponse response = phoneTopUpService.processTopUp(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error processing phone top-up: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Top-up failed");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get user's top-up history
     * GET /api/phone-topup/history/{userId}
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<?> getUserTopUpHistory(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("Getting top-up history for user: {}", userId);
            
            if (size <= 0) {
                // Return all without pagination
                List<PhoneTopUpResponse> history = phoneTopUpService.getUserTopUpHistory(userId);
                return ResponseEntity.ok(history);
            } else {
                // Return with pagination
                Pageable pageable = PageRequest.of(page, size);
                Page<PhoneTopUpResponse> history = phoneTopUpService.getUserTopUpHistory(userId, pageable);
                return ResponseEntity.ok(history);
            }
        } catch (Exception e) {
            log.error("Error getting top-up history: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get history");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get top-up by transaction ID
     * GET /api/phone-topup/transaction/{transactionId}
     */
    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<?> getTopUpByTransactionId(@PathVariable String transactionId) {
        try {
            log.info("Getting top-up by transaction ID: {}", transactionId);
            
            return phoneTopUpService.getTopUpByTransactionId(transactionId)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting top-up: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get top-up");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Verify face authentication for top-up
     * POST /api/phone-topup/verify-face-auth/{faceAuthSessionId}
     */
    @PostMapping("/verify-face-auth/{faceAuthSessionId}")
    public ResponseEntity<?> verifyFaceAuth(@PathVariable String faceAuthSessionId) {
        try {
            log.info("Verifying face auth for session: {}", faceAuthSessionId);
            
            PhoneTopUpResponse response = phoneTopUpService.verifyFaceAuth(faceAuthSessionId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error verifying face auth: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Face auth verification failed");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get active telecom providers
     * GET /api/phone-topup/providers
     */
    @GetMapping("/providers")
    public ResponseEntity<?> getActiveProviders() {
        try {
            log.info("Getting active telecom providers");
            
            List<TelecomProviderDto> providers = telecomProviderService.getActiveProviders();
            return ResponseEntity.ok(providers);
        } catch (Exception e) {
            log.error("Error getting providers: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get providers");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get provider by code
     * GET /api/phone-topup/providers/{providerCode}
     */
    @GetMapping("/providers/{providerCode}")
    public ResponseEntity<?> getProviderByCode(@PathVariable String providerCode) {
        try {
            log.info("Getting provider by code: {}", providerCode);
            
            return telecomProviderService.getProviderByCode(providerCode)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting provider: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get provider");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get denominations by provider
     * GET /api/phone-topup/providers/{providerId}/denominations
     */
    @GetMapping("/providers/{providerId}/denominations")
    public ResponseEntity<?> getDenominationsByProvider(@PathVariable Long providerId) {
        try {
            log.info("Getting denominations for provider: {}", providerId);
            
            List<TopUpDenominationDto> denominations = telecomProviderService.getDenominationsByProvider(providerId);
            return ResponseEntity.ok(denominations);
        } catch (Exception e) {
            log.error("Error getting denominations: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get denominations");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    /**
     * Get all active denominations
     * GET /api/phone-topup/denominations
     */
    @GetMapping("/denominations")
    public ResponseEntity<?> getAllActiveDenominations() {
        try {
            log.info("Getting all active denominations");
            
            List<TopUpDenominationDto> denominations = telecomProviderService.getAllActiveDenominations();
            return ResponseEntity.ok(denominations);
        } catch (Exception e) {
            log.error("Error getting denominations: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get denominations");
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}