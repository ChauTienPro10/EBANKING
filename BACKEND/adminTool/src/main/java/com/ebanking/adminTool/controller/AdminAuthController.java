package com.ebanking.admintool.controller;

import com.ebanking.admintool.dto.request.AdminLoginRequest;
import com.ebanking.admintool.dto.response.AdminLoginResponse;
import com.ebanking.admintool.service.AdminAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Admin Authentication Controller
 */
@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
@Slf4j
public class AdminAuthController {

    private final AdminAuthService adminAuthService;

    /**
     * Admin login endpoint
     * POST /api/admin/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AdminLoginRequest request) {
        try {
            log.info("Admin login request: {}", request.getUsername());
            AdminLoginResponse response = adminAuthService.login(request);
            
            if (response.getJwt() != null) {
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(403).body(response);
            }
        } catch (Exception e) {
            log.error("Admin login error", e);
            return ResponseEntity.status(401).body(
                    AdminLoginResponse.builder()
                            .message("Login failed: " + e.getMessage())
                            .build()
            );
        }
    }

    /**
     * Health check endpoint
     * GET /api/admin/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Admin Tool is running");
    }
}

