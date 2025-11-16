package com.ebanking.chatbotService.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import javax.annotation.PostConstruct;
import java.util.Map;

@Slf4j
@Service
public class GeminiService {

    private WebClient webClient;

    @Value("${gemini.api.key}")
    private String API_KEY;

    @Value("${gemini.url}")
    private String GEMINI_URL;

    @PostConstruct
    public void init() {
        this.webClient = WebClient.builder()
                .baseUrl(GEMINI_URL)
                .defaultHeader("Authorization", "Bearer " + API_KEY)
                .build();
    }

    public String sendMessage(String userMessage) {
        Map<String, Object> requestBody = Map.of(
                "prompt", Map.of("text", userMessage)
        );

        try {
            Mono<Map> responseMono = webClient.post()
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class);

            Map resp = responseMono.block();
            log.info("Gemini raw response: {}", resp);

            // TODO: parse response đúng theo cấu trúc JSON trả về
            // Ví dụ giả định:
            // String reply = (String) ((Map)((Map)((List)resp.get("candidates")).get(0)).get("content")).get("text");
            String reply = "TODO: parse JSON từ resp";

            return reply;
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            return "Error calling Gemini API";
        }
    }
}
