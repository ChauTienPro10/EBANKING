package com.ebanking.admintool.service;

import com.ebanking.admintool.dto.request.AdminLoginRequest;
import com.ebanking.admintool.dto.response.AdminLoginResponse;
import com.ebanking.admintool.entity.Admin;
import com.ebanking.admintool.exception.BusinessException;
import com.ebanking.admintool.repository.AdminRepository;
import com.ebanking.admintool.utils.AuditLogger;
import com.ebanking.admintool.utils.JWTUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Admin Authentication Service
 * Handles admin login and authentication
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtils jwtUtils;
    private final AuditLogger auditLogger;
    private final RefreshTokenService refreshTokenService;

    /**
     * Admin login with IP address tracking
     * FIXED: Now accepts IP address for audit logging
     */
    public AdminLoginResponse login(AdminLoginRequest request, String ipAddress) {
        log.info("Admin login attempt: {} from {}", request.getUsername(), ipAddress);

        Admin admin = adminRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    auditLogger.logFailure(request.getUsername(), "LOGIN", "ADMIN_SYSTEM", null,
                            "User not found", ipAddress);
                    return new BusinessException("INVALID_CREDENTIALS", "Invalid username or password",
                            HttpStatus.UNAUTHORIZED);
                });

        if (!admin.isActive()) {
            auditLogger.logFailure(request.getUsername(), "LOGIN", "ADMIN_SYSTEM", null,
                    "Account is deactivated", ipAddress);
            throw new BusinessException("ACCOUNT_DEACTIVATED", "Account is deactivated", HttpStatus.FORBIDDEN);
        }

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            auditLogger.logFailure(request.getUsername(), "LOGIN", "ADMIN_SYSTEM", null,
                    "Invalid password", ipAddress);
            throw new BusinessException("INVALID_CREDENTIALS", "Invalid username or password", HttpStatus.UNAUTHORIZED);
        }

        // If user is found, we assume they are authenticated. Now, we authorize them.
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                admin.getUsername(),
                null, // No credentials needed as authentication is assumed
                List.of(new SimpleGrantedAuthority(admin.getRole())));

        String jwt = jwtUtils.generateToken(authentication);
        log.debug("JWT token generated for user: {}", admin.getUsername());
        var refresh = refreshTokenService.createForUser(admin.getUsername());

        // FIXED: Now passes IP address to audit logger
        auditLogger.logSuccess(
                request.getUsername(),
                "LOGIN",
                "ADMIN_SYSTEM",
                null,
                "Admin login successful",
                ipAddress); // FIXED: Pass IP address

        log.info("Admin login successful: {} from {}", request.getUsername(), ipAddress);

        return AdminLoginResponse.builder()
                .id(admin.getId())
                .username(admin.getUsername())
                .fullName(admin.getFullName())
                .roles(List.of(admin.getRole()))
                .jwt(jwt)
                .refreshToken(refresh.getToken())
                .message("Login successful")
                .build();
    }

}
