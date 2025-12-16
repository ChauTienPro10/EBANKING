package com.ebanking.admintool;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
@org.springframework.scheduling.annotation.EnableScheduling
public class AdminToolApplication {

    public static void main(String[] args) {
        SpringApplication.run(AdminToolApplication.class, args);
    }

}