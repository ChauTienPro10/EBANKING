package com.ebanking.admintool.controller;

import com.ebanking.admintool.entity.Admin;
import com.ebanking.admintool.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/setup")
@RequiredArgsConstructor
@Slf4j
public class AdminSetupController {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/create-admin")
    public ResponseEntity<String> createAdmin(
            @RequestParam String username,
            @RequestParam String password,
            @RequestParam String fullName,
            @RequestParam(defaultValue = "ROLE_ADMIN") String role) {
        
        if (adminRepository.findByUsername(username).isPresent()) {
            throw new com.ebanking.admintool.exception.BusinessException(
                    "USERNAME_EXISTS", 
                    "Admin already exists", 
                    org.springframework.http.HttpStatus.CONFLICT);
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

