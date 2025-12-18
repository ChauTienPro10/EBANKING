package com.ebanking.adminTool.config;

import com.ebanking.adminTool.entity.Admin;
import com.ebanking.adminTool.entity.AuditLog;
import com.ebanking.adminTool.repository.AdminRepository;
import com.ebanking.adminTool.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogRepository auditLogRepository;

    @Override
    public void run(String... args) throws Exception {
        if (adminRepository.findByUsername("admin").isEmpty()) {
            Admin defaultAdmin = Admin.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin"))
                    .fullName("Default Admin")
                    .role("ROLE_ADMIN")
                    .active(true)
                    .build();
            adminRepository.save(defaultAdmin);
            log.info("Default admin account created");
        }

        long auditCount = auditLogRepository.count();
        log.info("Current audit log count: {}", auditCount);
        
        if (auditCount == 0) {
            AuditLog testLog = AuditLog.builder()
                    .staffUsername("admin")
                    .action("LOGIN")
                    .targetType("ADMIN_SYSTEM")
                    .targetId(null)
                    .details("Test login - system initialized")
                    .success(true)
                    .ipAddress("127.0.0.1")
                    .timestamp(LocalDateTime.now())
                    .build();
            auditLogRepository.save(testLog);
            log.info("Test audit log created");
        }
    }
}
