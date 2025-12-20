package com.ebanking.adminTool.controller;

import com.ebanking.adminTool.entity.Admin;
import com.ebanking.adminTool.exception.BusinessException;
import com.ebanking.adminTool.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Admin Setup Controller
 * Provides endpoints for initial admin account creation
 * WARNING: These endpoints should be disabled in production or protected by IP whitelist
 */
@RestController
@RequestMapping("/setup")
@RequiredArgsConstructor
@Slf4j
public class AdminSetupController {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Create a new admin account
     * POST /admin/setup/create-admin
     */
    @PostMapping("/create-admin")
    public ResponseEntity<String> createAdmin(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String fullName,
            @RequestParam(defaultValue = "ROLE_ADMIN") String role) {

        if (adminRepository.findByUsername(username).isPresent()) {
            throw new BusinessException(
                    "USERNAME_EXISTS",
                    "Admin already exists",
                    HttpStatus.CONFLICT);
        }

        Admin admin = Admin.builder()
                .username(username)
                .password(passwordEncoder.encode(password))
                .fullName(fullName)
                .role(role)
                .active(true)
                .build();

        adminRepository.save(admin);
        log.info("Admin created: {}", username);
        return ResponseEntity.ok("Admin created successfully");
    }
}
