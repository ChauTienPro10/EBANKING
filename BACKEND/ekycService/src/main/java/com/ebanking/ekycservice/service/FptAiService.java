package com.ebanking.ekycservice.service;

import com.ebanking.ekycservice.config.FptAiConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FptAiService {
    private final FptAiConfig fptAiConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @SuppressWarnings("unchecked")
    public Map<String, Object> callOrcApi(String imageBase64) {
        try {
            String cleanBase64 = cleanBase64String(imageBase64);
            byte[] imageBytes = java.util.Base64.getDecoder().decode(cleanBase64);

            log.info("Calling FPT.AI OCR API with image size: {} bytes", imageBytes.length);

            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", fptAiConfig.getApiKey());
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            org.springframework.core.io.ByteArrayResource imageResource = new org.springframework.core.io.ByteArrayResource(imageBytes) {
                @Override
                public String getFilename() {
                    return "image.jpg";
                }
            };

            org.springframework.util.MultiValueMap<String, Object> body = new org.springframework.util.LinkedMultiValueMap<>();
            body.add("image", imageResource);

            HttpEntity<org.springframework.util.MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    fptAiConfig.getOcrUrl(),
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            log.info("FPT.AI OCR response status: {}", response.getStatusCode());

            Map<String, Object> responseBody = objectMapper.readValue(response.getBody(), Map.class);

            Object errorCode = responseBody.get("errorCode");
            if (errorCode != null && !errorCode.toString().equals("0")) {
                String errorMessage = (String) responseBody.get("errorMessage");
                log.error("FPT.AI OCR API returned error: code={}, message={}", errorCode, errorMessage);
                throw new RuntimeException("FPT.AI OCR error: " + errorMessage);
            }

            return responseBody;
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("FPT.AI OCR HTTP error: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("OCR API request failed: " + e.getMessage());
        } catch (Exception e) {
            log.error("FPT.AI OCR failed: {}", e.getMessage(), e);
            throw new RuntimeException("OCR processing failed: " + e.getMessage());
        }
    }

    /**
     * Clean and normalize base64 string
     */
    private String cleanBase64String(String base64) {
        if (base64 == null || base64.isEmpty()) {
            throw new IllegalArgumentException("Base64 string cannot be null or empty");
        }

        String cleaned = base64;
        if (cleaned.contains("base64,")) {
            cleaned = cleaned.substring(cleaned.indexOf("base64,") + 7);
        }

        return cleaned.replaceAll("\\s+", "").trim();
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> callLivenessApi(String videoBase64) {
        try {
            log.info("Calling FPT.AI Liveness API with video size: {} characters", videoBase64.length());

            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", fptAiConfig.getApiKey());
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = Map.of("video", videoBase64);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    fptAiConfig.getLivenessUrl(),
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            log.info("FPT.AI Liveness response status: {}", response.getStatusCode());

            Map<String, Object> responseBody = objectMapper.readValue(response.getBody(), Map.class);

            Object errorCode = responseBody.get("errorCode");
            if (errorCode != null && !errorCode.toString().equals("0")) {
                String errorMessage = (String) responseBody.get("errorMessage");
                log.error("FPT.AI Liveness API returned error: code={}, message={}", errorCode, errorMessage);
                throw new RuntimeException("FPT.AI Liveness error: " + errorMessage);
            }

            return responseBody;

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("FPT.AI Liveness HTTP error: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Liveness API request failed: " + e.getMessage());
        } catch (Exception e) {
            log.error("FPT.AI Liveness failed: {}", e.getMessage(), e);
            throw new RuntimeException("Liveness check failed: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> callFaceMatchApi(String image1Base64, String image2Base64) {
        try {
            log.info("Calling FPT.AI Face Match API");

            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", fptAiConfig.getApiKey());
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> requestBody = Map.of(
                    "image1", image1Base64,
                    "image2", image2Base64
            );

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    fptAiConfig.getFaceMatchUrl(),
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            log.info("FPT.AI Face Match response status: {}", response.getStatusCode());

            Map<String, Object> responseBody = objectMapper.readValue(response.getBody(), Map.class);

            Object errorCode = responseBody.get("errorCode");
            if (errorCode != null && !errorCode.toString().equals("0")) {
                String errorMessage = (String) responseBody.get("errorMessage");
                log.error("FPT.AI Face Match API returned error: code={}, message={}", errorCode, errorMessage);
                throw new RuntimeException("FPT.AI Face Match error: " + errorMessage);
            }

            return responseBody;

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("FPT.AI Face Match HTTP error: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            throw new RuntimeException("Face Match API request failed: " + e.getMessage());
        } catch (Exception e) {
            log.error("FPT.AI Face Match failed: {}", e.getMessage(), e);
            throw new RuntimeException("Face matching failed: " + e.getMessage());
        }
    }
}
