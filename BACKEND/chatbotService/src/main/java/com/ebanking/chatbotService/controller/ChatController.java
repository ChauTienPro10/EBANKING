package com.ebanking.chatbotService.controller;

import com.ebanking.chatbotService.dto.request.QuestionRequest;
import com.ebanking.chatbotService.service.GeminiService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/chat")
@Slf4j
public class ChatController {

    private final GeminiService geminiService;

    public ChatController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/ask")
    public String askGemini(@RequestBody QuestionRequest request) {
        log.info("Received question from user {}: {}", request.getUsername(), request.getText());
        
        try {
            String response = geminiService.generate(request.getText(), request.getUsername());
            log.info("Generated response for user {}", request.getUsername());
            return response;
            
        } catch (Exception e) {
            log.error("Error processing question for user {}: {}", request.getUsername(), e.getMessage());
            return "Xin lỗi, có lỗi xảy ra khi xử lý câu hỏi của bạn. Vui lòng thử lại sau.";
        }
    }
}
