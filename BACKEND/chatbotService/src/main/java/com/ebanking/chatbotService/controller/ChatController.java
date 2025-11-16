package com.ebanking.chatbotService.controller;

import com.ebanking.chatbotService.dto.request.QuestionRequest;
import com.ebanking.chatbotService.dto.response.QuestionResponse;
import com.ebanking.chatbotService.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/gemini")
public class ChatController {

    @Autowired
    GeminiService geminiService;

    @PostMapping("/send-question")
    public ResponseEntity<QuestionResponse> questionBot(@RequestBody QuestionRequest request) {
        String rsFromGemini = geminiService.sendMessage(request.getText());

        QuestionResponse response = QuestionResponse.builder()
                .text(rsFromGemini)
                .time(System.currentTimeMillis())
                .build();

        return ResponseEntity.ok(response);
    }
}
