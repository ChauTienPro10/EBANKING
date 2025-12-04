package com.ebanking.admintool.controller;

import com.ebanking.admintool.dto.request.BanUserRequest;
import com.ebanking.admintool.dto.request.LockUserRequest;
import com.ebanking.admintool.dto.response.UserDetailResponse;
import com.ebanking.admintool.dto.response.UserStatusResponse;
import com.ebanking.admintool.service.AdminUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Admin User Management Controller
 */
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@Slf4j
public class AdminUserController {

    private final AdminUserService adminUserService;

    /**
     * Get user detail by username
     * GET /api/admin/users/{username}
     */
    @GetMapping("/{username}")
    public ResponseEntity<?> getUserByUsername(
            @PathVariable String username,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            log.info("Admin {} fetching user: {}", adminUsername, username);

            UserDetailResponse response = adminUserService.getUserDetail(adminUsername, username);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching user detail", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * Get user detail by ID
     * GET /api/admin/users/id/{userId}
     */
    @GetMapping("/id/{userId}")
    public ResponseEntity<?> getUserById(
            @PathVariable Long userId,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            log.info("Admin {} fetching user ID: {}", adminUsername, userId);

            UserDetailResponse response = adminUserService.getUserById(adminUsername, userId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching user detail", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * Lock user account temporarily
     * POST /api/admin/users/lock
     */
    @PostMapping("/lock")
    public ResponseEntity<?> lockUser(
            @RequestBody LockUserRequest request,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            log.info("Admin {} locking user ID: {}", adminUsername, request.getUserId());

            var userStatus = adminUserService.lockUser(
                    adminUsername,
                    request.getUserId(),
                    request.getReason(),
                    request.getExpiresAt());

            return ResponseEntity.ok(UserStatusResponse.fromEntity(userStatus));
        } catch (Exception e) {
            log.error("Error locking user", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * Unlock user account
     * POST /api/admin/users/unlock
     */
    @PostMapping("/unlock")
    public ResponseEntity<?> unlockUser(
            @RequestParam Long userId,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            log.info("Admin {} unlocking user ID: {}", adminUsername, userId);

            var userStatus = adminUserService.unlockUser(adminUsername, userId);
            return ResponseEntity.ok(UserStatusResponse.fromEntity(userStatus));
        } catch (Exception e) {
            log.error("Error unlocking user", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * Ban user permanently
     * POST /api/admin/users/ban
     */
    @PostMapping("/ban")
    public ResponseEntity<?> banUser(
            @RequestBody BanUserRequest request,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            log.info("Admin {} banning user ID: {}", adminUsername, request.getUserId());

            var userStatus = adminUserService.banUser(
                    adminUsername,
                    request.getUserId(),
                    request.getReason());

            return ResponseEntity.ok(UserStatusResponse.fromEntity(userStatus));
        } catch (Exception e) {
            log.error("Error banning user", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    /**
     * Get user status
     * GET /api/admin/users/{userId}/status
     */
    @GetMapping("/{userId}/status")
    public ResponseEntity<?> getUserStatus(
            @PathVariable Long userId,
            Authentication authentication) {
        try {
            String adminUsername = authentication.getName();
            log.info("Admin {} fetching user status for ID: {}", adminUsername, userId);

            var userStatus = adminUserService.getUserStatus(userId);
            return ResponseEntity.ok(UserStatusResponse.fromEntity(userStatus));
        } catch (Exception e) {
            log.error("Error fetching user status", e);
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}
