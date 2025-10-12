package com.ebanking.emailService.service;

import com.ebanking.emailService.entity.EmailTemplate;
import com.ebanking.emailService.repository.EmailTemplateRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class EmailService {

    @Value("${send.email.from}")
    String email;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    EmailTemplateRepository emailTemplateRepository;

    public void sendSimpleEmail(String to, String type, Map<String, String> placeholders) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(email);

        EmailTemplate emailTemplate = emailTemplateRepository.findByType(type);
        String content = emailTemplate.getContent();
        for (Map.Entry<String, String> entry : placeholders.entrySet()) {
            content = content.replace("${" + entry.getKey() + "}", entry.getValue());
        }
        switch (type) {
            case "create_user" :
            case "gen_otp":
            case "transfer_send_email":
            case "change_password":
                message.setTo(to);
                message.setSubject(emailTemplate.getTitle());
                message.setText(content);
                mailSender.send(message);
                break;
            default:
                break;
        }
    }
}
