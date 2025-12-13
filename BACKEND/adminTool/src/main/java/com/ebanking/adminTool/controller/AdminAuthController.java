package com.ebanking.admintool.controller;

import com.ebanking.admintool.dto.request.AdminLoginRequest;
import com.ebanking.admintool.dto.request.RefreshRequest;
import com.ebanking.admintool.dto.response.AdminLoginResponse;
import com.ebanking.admintool.entity.Admin;
import com.ebanking.admintool.exception.BusinessException;
import com.ebanking.admintool.exception.ResourceNotFoundException;
import com.ebanking.admintool.repository.AdminRepository;
import com.ebanking.admintool.service.AdminAuthService;
import com.ebanking.admintool.service.LoginRateLimiterService;
import com.ebanking.admintool.service.RefreshTokenService;
import com.ebanking.admintool.utils.AuditLogger;
import com.ebanking.admintool.utils.JWTUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
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
    private final RefreshTokenService refreshTokenService;
    private final AdminRepository adminRepository;
    private final JWTUtils jwtUtils;
    private final AuditLogger auditLogger;
    private final LoginRateLimiterService rateLimiter;

    /**
     * Admin login endpoint
     * POST /api/admin/auth/login
     * FIXED: Now passes IP address to audit logger
     */
    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(@RequestBody AdminLoginRequest request,
            HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        rateLimiter.checkAllowed(ip);
        log.info("Admin login request: {} from {}", request.getUsername(), ip);

        try {
            AdminLoginResponse response = adminAuthService.login(request, ip);
            rateLimiter.onSuccess(ip);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            rateLimiter.onFailure(ip);
            throw e; // Let GlobalExceptionHandler handle it
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AdminLoginResponse> refresh(@RequestBody RefreshRequest request) {
        var newRefresh = refreshTokenService.rotate(request.getRefreshToken());
        Admin admin = adminRepository.findByUsername(newRefresh.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Admin", newRefresh.getUsername()));

        if (!admin.isActive()) {
            throw new BusinessException("ACCOUNT_DEACTIVATED", "Account is deactivated", HttpStatus.FORBIDDEN);
        }

        Authentication authentication = new UsernamePasswordAuthenticationToken(
                admin.getUsername(), null, java.util.List.of(new SimpleGrantedAuthority(admin.getRole())));
        String jwt = jwtUtils.generateToken(authentication);
        auditLogger.logSuccess(admin.getUsername(), "REFRESH_TOKEN", "ADMIN_SYSTEM", null, "Token rotated", null);

        return ResponseEntity.ok(AdminLoginResponse.builder()
                .id(admin.getId())
                .username(admin.getUsername())
                .fullName(admin.getFullName())
                .roles(java.util.List.of(admin.getRole()))
                .jwt(jwt)
                .refreshToken(newRefresh.getToken())
                .message("Refreshed")
                .build());
    }

    @GetMapping("/whoami")
    public ResponseEntity<?> whoami(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("No authentication");
        }
        var roles = authentication.getAuthorities().stream().map(a -> a.getAuthority()).toList();
        return ResponseEntity.ok(java.util.Map.of(
                "username", authentication.getName(),
                "roles", roles));
    }

}
