package com.ebanking.ekycservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.domain.AuditorAware;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.Optional;
import java.util.TimeZone;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorProvider")
public class EkycServiceApplication {

    public static void main(String[] args) {
        // Set timezone to UTC to avoid PostgreSQL timezone issues
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        System.setProperty("user.timezone", "UTC");

        SpringApplication.run(EkycServiceApplication.class, args);
        System.out.println("eKYC Service is up and running!");
    }

    /**
     * Provide auditor for JPA auditing (created_by, updated_by fields)
     * For eKYC service, use "SYSTEM" since sessions are created by system on behalf of users
     */
    @Bean
    public AuditorAware<String> auditorProvider() {
        return () -> Optional.of("SYSTEM");
    }

}
