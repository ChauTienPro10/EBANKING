package com.ebanking.adminTool;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
//import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
//import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class AdminToolApplication {

    public static void main(String[] args) {
        SpringApplication.run(AdminToolApplication.class, args);
//        PasswordEncoder encoder = new BCryptPasswordEncoder();
//        System.out.println(encoder.encode("admin123"));
    }

}