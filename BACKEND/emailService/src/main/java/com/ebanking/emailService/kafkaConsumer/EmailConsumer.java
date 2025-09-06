package com.ebanking.emailService.kafkaConsumer;

import com.ebanking.emailService.dto.OtpRegister;
import com.ebanking.emailService.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class EmailConsumer {

    @Autowired
    private EmailService emailService;

    @KafkaListener(topics = "send-email", groupId = "email-group")
    public void listenSendEmail(String message) {
        System.out.println("Received message: " + message);
        // xử lý message ở đây
        Map<String, String> placeholders = new HashMap<>();
        placeholders.put("userName", "Nguyễn Văn A");
        placeholders.put("email", "chauduongphattien2201@gmail.com");
        placeholders.put("createdAt", "17/08/2025");
        placeholders.put("fullName", "Nguyễn Văn A");
        placeholders.put("citizenId", "123456789");

        emailService.sendSimpleEmail("chauduongphattien2201@gmail.com", "create_user", placeholders);
    }

    @KafkaListener(topics = "send-otp", groupId = "email-group")
    public void listenSendOtp(OtpRegister otpRegister) {
        Map<String, String> placeholders = new HashMap<>();
        placeholders.put("userName", otpRegister.getUsername());
        placeholders.put("email", otpRegister.getUsername());
        placeholders.put("expireTime", "300");
        placeholders.put("otpValue", String.valueOf(otpRegister.getOtpValue()));

        emailService.sendSimpleEmail("chauduongphattien2201@gmail.com", "gen_otp", placeholders);
    }
}
