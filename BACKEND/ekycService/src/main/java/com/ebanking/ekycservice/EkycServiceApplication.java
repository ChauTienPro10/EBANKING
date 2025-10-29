package com.ebanking.ekycservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import java.util.TimeZone;

@SpringBootApplication
@EnableJpaAuditing
public class EkycServiceApplication {

    public static void main(String[] args) {
        // Set timezone to UTC to avoid PostgreSQL timezone issues
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        System.setProperty("user.timezone", "UTC");

        SpringApplication.run(EkycServiceApplication.class, args);
        System.out.println("eKYC Service is up and running!");
    }

}
