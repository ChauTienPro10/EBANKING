package com.ebanking.ekycservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EkycServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(EkycServiceApplication.class, args);
        System.out.println("eKYC Service is up and running!");
    }

}
