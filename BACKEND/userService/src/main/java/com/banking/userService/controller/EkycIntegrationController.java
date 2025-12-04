package com.banking.userService.controller;

import com.banking.userService.dto.request.EkycVerificationRequest;
import com.banking.userService.dto.response.EkycStatusResponse;
import com.banking.userService.service.EkycIntegrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class EkycIntegrationController {

    private final EkycIntegrationService ekycIntegrationService;

    /**
     * Internal API: Called by EkycService after successful face match
     * Should be protected with API key or service-to-service JWT
     */
    @PostMapping("/internal/{userId}/ekyc/verify")
    public ResponseEntity<Void> verifyEkyc(
            @PathVariable Long userId,
            @Valid @RequestBody EkycVerificationRequest request,
            @RequestHeader(value = "X-Service-API-Key", required = false) String apiKey) {

        log.info("Received eKYC verification request for user: {}, sessionId: {}",
                userId, request.getSessionId());

        // Validate API key (simple approach, use JWT in production)
        if (apiKey == null || !apiKey.equals("EKYC_SERVICE_SECRET_KEY")) {
            log.warn("Invalid API key from EkycService");
            return ResponseEntity.status(403).build();
        }

        ekycIntegrationService.markUserAsVerified(userId, request);

        log.info("User {} marked as eKYC verified", userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Public API: Get eKYC status for current user
     */
    @GetMapping("/{userId}/ekyc/status")
    public ResponseEntity<EkycStatusResponse> getEkycStatus(@PathVariable Long userId) {
        log.info("Getting eKYC status for user: {}", userId);

        EkycStatusResponse response = ekycIntegrationService.getEkycStatus(userId);
        return ResponseEntity.ok(response);
    }

    /**
     * Public API: Reset eKYC status to allow retry
     */
    @PostMapping("/{userId}/ekyc/retry")
    public ResponseEntity<Void> retryEkyc(@PathVariable Long userId) {
        log.info("Resetting eKYC status for user: {}", userId);

        ekycIntegrationService.resetEkycStatus(userId);
        return ResponseEntity.ok().build();
    }
}
