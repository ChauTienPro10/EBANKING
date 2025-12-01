package com.ebanking.ekycservice.service;

import com.ebanking.ekycservice.config.FptAiConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class FptAiService {
    private final FptAiConfig fptAiConfig;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final ImageEnhancementService imageEnhancer;

    @org.springframework.beans.factory.annotation.Value("${app.image-enhancement.enabled:true}")
    private boolean imageEnhancementEnabled;

    @SuppressWarnings("unchecked")
    public Map<String, Object> callOrcApi(String imageBase64) {
        try {
            String cleanBase64 = cleanBase64String(imageBase64);
            byte[] imageBytes = java.util.Base64.getDecoder().decode(cleanBase64);

            log.info("Calling FPT.AI OCR API with image size: {} bytes", imageBytes.length);

            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", fptAiConfig.getApiKey());
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            org.springframework.core.io.ByteArrayResource imageResource = new org.springframework.core.io.ByteArrayResource(
                    imageBytes) {
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
                    String.class);

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

            // Decode base64 to bytes
            byte[] videoBytes = Base64.getDecoder().decode(cleanBase64String(videoBase64));

            // Create multipart request
            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", fptAiConfig.getApiKey());
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            ByteArrayResource videoResource = new ByteArrayResource(videoBytes) {
                @Override
                public String getFilename() {
                    return "video.mp4";
                }
            };
            body.add("video", videoResource);

            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    fptAiConfig.getLivenessUrl(),
                    HttpMethod.POST,
                    entity,
                    String.class);

            log.info("FPT.AI Liveness response status: {}", response.getStatusCode());
            log.info("FPT.AI Liveness raw response: {}", response.getBody());

            Map<String, Object> responseBody = objectMapper.readValue(response.getBody(), Map.class);

            // Check for error in response (FPT returns "code": "200" for success, 4xx/5xx
            // for errors)
            Object code = responseBody.get("code");
            if (code != null) {
                String codeStr = code.toString();
                // Success codes: "200", "0"
                // Error codes: "406", "409", etc.
                if (!codeStr.equals("200") && !codeStr.equals("0")) {
                    String message = (String) responseBody.get("message");
                    log.error("FPT.AI Liveness API returned error: code={}, message={}", code, message);
                    throw new RuntimeException("FPT.AI Liveness error: " + message);
                }
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
            log.info("Calling FPT.AI Face Match API (enhancement={})", imageEnhancementEnabled);

            // 🎨 ENHANCEMENT: Improve image quality before Face Match
            String enhancedImage1 = image1Base64;
            String enhancedImage2 = image2Base64;

            if (imageEnhancementEnabled) {
                enhancedImage1 = imageEnhancer.enhanceImageAuto(image1Base64);
                enhancedImage2 = imageEnhancer.enhanceImageAuto(image2Base64);
                log.info("✅ Images enhanced for Face Match");
            } else {
                log.info("⚠️ Image enhancement disabled, using original images");
            }

            // Convert base64 to byte arrays
            byte[] imageBytes1 = Base64.getDecoder()
                    .decode(enhancedImage1.replaceAll("^data:image/[a-z]+;base64,", ""));
            byte[] imageBytes2 = Base64.getDecoder()
                    .decode(enhancedImage2.replaceAll("^data:image/[a-z]+;base64,", ""));

            // Create multipart form data with 2 files
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();

            // Add first image
            ByteArrayResource resource1 = new ByteArrayResource(imageBytes1) {
                @Override
                public String getFilename() {
                    return "image1.jpg";
                }
            };
            body.add("file[]", resource1);

            // Add second image
            ByteArrayResource resource2 = new ByteArrayResource(imageBytes2) {
                @Override
                public String getFilename() {
                    return "image2.jpg";
                }
            };
            body.add("file[]", resource2);

            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", fptAiConfig.getApiKey());
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    fptAiConfig.getFaceMatchUrl(),
                    HttpMethod.POST,
                    entity,
                    String.class);

            log.info("FPT.AI Face Match response status: {}", response.getStatusCode());
            log.info("FPT.AI Face Match raw response: {}", response.getBody());

            Map<String, Object> responseBody = objectMapper.readValue(response.getBody(), Map.class);
            log.info("FPT.AI Face Match parsed response: {}", responseBody);

            // Check for error using "code" field
            Object code = responseBody.get("code");
            if (code != null && !code.toString().equals("200")) {
                Object dataObj = responseBody.get("data");
                String errorMessage = dataObj != null ? dataObj.toString() : "Unknown error";
                log.error("FPT.AI Face Match API returned error: code={}, message={}", code, errorMessage);
                throw new RuntimeException("FPT.AI Face Match error: " + errorMessage);
            }

            return responseBody;

        } catch (HttpClientErrorException | HttpServerErrorException e) {
            log.error("FPT.AI Face Match HTTP error: status={}, body={}", e.getStatusCode(),
                    e.getResponseBodyAsString());
            throw new RuntimeException("Face Match API request failed: " + e.getMessage());
        } catch (Exception e) {
            log.error("FPT.AI Face Match failed: {}", e.getMessage(), e);
            throw new RuntimeException("Face matching failed: " + e.getMessage());
        }
    }
}
