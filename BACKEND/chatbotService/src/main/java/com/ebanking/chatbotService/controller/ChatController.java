package com.ebanking.chatbotService.controller;

import com.ebanking.chatbotService.dto.request.QuestionRequest;
import com.ebanking.chatbotService.service.GeminiService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/chat")
public class ChatController {

    private final GeminiService geminiService; // Giả định Service của bạn

    // Constructor Injection
    public ChatController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/ask")
    public String askGemini(@RequestBody QuestionRequest request) {
        return geminiService.generate(request.getText()); // Gọi service để tương tác với Gemini
    }
}
