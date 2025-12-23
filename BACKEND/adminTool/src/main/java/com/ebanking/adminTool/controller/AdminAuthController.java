package com.ebanking.adminTool.controller;

import com.ebanking.adminTool.dto.request.AdminLoginRequest;
import com.ebanking.adminTool.dto.request.RefreshRequest;
import com.ebanking.adminTool.dto.response.AdminLoginResponse;
import com.ebanking.adminTool.entity.Admin;
import com.ebanking.adminTool.exception.BusinessException;
import com.ebanking.adminTool.exception.ResourceNotFoundException;
import com.ebanking.adminTool.repository.AdminRepository;
import com.ebanking.adminTool.service.AdminAuthService;
import com.ebanking.adminTool.service.LoginRateLimiterService;
import com.ebanking.adminTool.service.RefreshTokenService;
import com.ebanking.adminTool.utils.AuditLogger;
import com.ebanking.adminTool.utils.JWTUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import jakarta.annotation.security.PermitAll;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

/**
 * Admin Authentication Controller
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AdminAuthController {

    private final AdminAuthService adminAuthService;
    private final RefreshTokenService refreshTokenService;
    private final AdminRepository adminRepository;
    private final JWTUtils jwtUtils;
    private final AuditLogger auditLogger;
    private final LoginRateLimiterService rateLimiter;

    @PostMapping("/login")
    @PermitAll
    public ResponseEntity<AdminLoginResponse> login(@RequestBody AdminLoginRequest request,
            HttpServletRequest httpRequest) {
        String ip = getClientIp(httpRequest);
        rateLimiter.checkAllowed(ip);
        log.info("Admin login request: {} from {}", request.getUsername(), ip);

        try {
            AdminLoginResponse response = adminAuthService.login(request, ip);
            rateLimiter.onSuccess(ip);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            rateLimiter.onFailure(ip);
            throw e;
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String header = request.getHeader("X-Forwarded-For");
        if (header != null && !header.isEmpty() && !"unknown".equalsIgnoreCase(header)) {
            int commaIndex = header.indexOf(',');
            return (commaIndex != -1 ? header.substring(0, commaIndex) : header).trim();
        }

        header = request.getHeader("X-Real-IP");
        if (header != null && !header.isEmpty() && !"unknown".equalsIgnoreCase(header)) {
            return header.trim();
        }

        return request.getRemoteAddr();
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
