package com.ebanking.admintool.config;

import com.ebanking.admintool.entity.Admin;
import com.ebanking.admintool.repository.AdminRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (adminRepository.findByUsername("admin").isEmpty()) {
            Admin defaultAdmin = Admin.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin"))
                    .fullName("Default Admin")
                    .role("ROLE_SUPER_ADMIN")
                    .build();
            adminRepository.save(defaultAdmin);
        }
    }
}
