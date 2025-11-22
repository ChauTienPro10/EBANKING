package com.example.auth.controller;

import com.example.auth.dto.request.QuestionRequest;
import com.example.auth.utils.HttpUltils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chatService")
@Slf4j
public class ChatController {
    @Autowired private HttpUltils httpUltils;
    @Value("${chat.service}")
    String chatServiceUrl;

    @PostMapping("/ask")
    public ResponseEntity<String> askBot(@RequestBody QuestionRequest request) {
        try {
            String url = chatServiceUrl + "chat/ask";
            String rs = httpUltils.post(url, request, String.class);
            return ResponseEntity.ok(rs);
        } catch (Exception e) {
            log.error(e.getMessage());
            return ResponseEntity.status(500).body("Đã xảy ra lỗi hệ thống khi xử lý yêu cầu Chatbot.");
        }
    }
}
