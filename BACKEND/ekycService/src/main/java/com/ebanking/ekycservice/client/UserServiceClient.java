package com.ebanking.ekycservice.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@Slf4j
public class UserServiceClient {

    @Value("${services.user-service.url:http://localhost:8001}")
    private String userServiceUrl;

    @Value("${services.user-service.api-key:EKYC_SERVICE_SECRET_KEY}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Notify UserService that eKYC verification is completed
     */
    public void notifyEkycVerified(Long userId, UUID sessionId) {
        String url = userServiceUrl + "/api/users/internal/" + userId + "/ekyc/verify";

        Map<String, Object> request = new HashMap<>();
        request.put("sessionId", sessionId.toString());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Service-API-Key", apiKey);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);

        try {
            ResponseEntity<Void> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    Void.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                log.info("✅ Successfully notified UserService: userId={}, sessionId={}", userId, sessionId);
            } else {
                log.warn("⚠️ UserService returned non-OK status: {}", response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("❌ Failed to notify UserService: userId={}, error={}", userId, e.getMessage());
            // Don't throw exception - eKYC is still valid even if notification fails
            // Can implement retry logic or message queue here
        }
    }
}
