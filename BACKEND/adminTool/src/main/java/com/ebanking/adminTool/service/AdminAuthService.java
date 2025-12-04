package com.ebanking.admintool.service;

import com.banking.userService.grpc.UserProto;
import com.ebanking.admintool.dto.request.AdminLoginRequest;
import com.ebanking.admintool.dto.response.AdminLoginResponse;
import com.ebanking.admintool.service.grpc.UserGrpcClient;
import com.ebanking.admintool.utils.AuditLogger;
import com.ebanking.admintool.utils.JWTUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Admin Authentication Service
 * Handles admin login and authentication
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AdminAuthService {

    private final UserGrpcClient userGrpcClient;
    private final JWTUtils jwtUtils;
    private final AuditLogger auditLogger;

    private static final List<String> ADMIN_ROLES = List.of("ROLE_ADMIN", "ROLE_SUPERVISOR", "ROLE_VIEWER");

    /**
     * Admin login
     * Only users with admin roles can login
     */
    public AdminLoginResponse login(AdminLoginRequest request) {
        try {
            log.info("Admin login attempt: {}", request.getUsername());

            // Call user service to authenticate
            UserProto.LoginResponse loginResponse = userGrpcClient.login(
                    request.getUsername(), 
                    request.getPassword()
            );

            UserProto.User user = loginResponse.getUser();
            List<String> userRoles = user.getRolesList();

            // Check if user has admin role
            boolean hasAdminRole = userRoles.stream()
                    .anyMatch(ADMIN_ROLES::contains);

            if (!hasAdminRole) {
                auditLogger.logFailure(
                        request.getUsername(),
                        "LOGIN",
                        "ADMIN_SYSTEM",
                        null,
                        "User does not have admin role"
                );
                return AdminLoginResponse.builder()
                        .message("Access denied. You don't have admin privileges.")
                        .build();
            }

            // Generate JWT token for admin
            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    request.getUsername(),
                    null,
                    userRoles.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList())
            );

            String jwt = jwtUtils.generateToken(authentication);

            // Log successful login
            auditLogger.logSuccess(
                    request.getUsername(),
                    "LOGIN",
                    "ADMIN_SYSTEM",
                    null,
                    "Admin login successful"
            );

            log.info("Admin login successful: {}", request.getUsername());

            return AdminLoginResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .roles(userRoles)
                    .jwt(jwt)
                    .message("Login successful")
                    .build();

        } catch (Exception e) {
            log.error("Admin login failed", e);
            auditLogger.logFailure(
                    request.getUsername(),
                    "LOGIN",
                    "ADMIN_SYSTEM",
                    null,
                    "Login failed: " + e.getMessage()
            );
            throw new RuntimeException("Login failed: " + e.getMessage());
        }
    }

    /**
     * Check if user has specific role
     */
    public boolean hasRole(String username, String role) {
        try {
            long userId = userGrpcClient.getUserIdByUsername(username);
            UserProto.UserResponse userResponse = userGrpcClient.getUserById(userId);
            return userResponse.getUser().getRolesList().contains(role);
        } catch (Exception e) {
            log.error("Failed to check user role", e);
            return false;
        }
    }

    /**
     * Check if user has any admin role
     */
    public boolean isAdmin(String username) {
        try {
            long userId = userGrpcClient.getUserIdByUsername(username);
            UserProto.UserResponse userResponse = userGrpcClient.getUserById(userId);
            List<String> userRoles = userResponse.getUser().getRolesList();
            return userRoles.stream().anyMatch(ADMIN_ROLES::contains);
        } catch (Exception e) {
            log.error("Failed to check admin status", e);
            return false;
        }
    }
}

