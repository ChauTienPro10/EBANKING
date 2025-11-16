//package com.ebanking.chatbotService.config;
//
//import lombok.RequiredArgsConstructor;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.MediaType;
//import org.springframework.web.reactive.function.client.WebClient;
//
//import java.util.Collections;
//
//@Configuration
//@RequiredArgsConstructor
//public class GeminiConfig {
//
//    @Value("${gemini.api.key}")
//    private String apiKey;
//
//    @Value("${gemini.url}")
//    private String baseUrl;
//
//    @Bean
//    public WebClient geminiClient() {
//        return WebClient.builder()
//                .baseUrl(baseUrl)
//                .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
//                .defaultHeader("x-goog-api-key", apiKey)   // THÊM DÒNG NÀY
//                .build();
//    }
//}