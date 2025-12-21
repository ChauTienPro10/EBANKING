package com.ebanking.ekycservice.client;

import com.ebanking.ekycservice.entity.DocumentInfo;
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
     * Includes OCR data to update user profile
     */
    public void notifyEkycVerified(Long userId, UUID sessionId,
            com.ebanking.ekycservice.entity.DocumentInfo documentInfo) {
        String url = userServiceUrl + "/api/users/internal/" + userId + "/ekyc/verify";

        Map<String, Object> request = new HashMap<>();
        request.put("sessionId", sessionId.toString());

        // Add OCR data to update user profile
        if (documentInfo != null) {
            request.put("idNumber", documentInfo.getIdNumber());
            request.put("fullName", documentInfo.getFullName());
            
            // dateOfBirth is already LocalDate, convert to ISO string (yyyy-MM-dd)
            if (documentInfo.getDateOfBirth() != null) {
                request.put("dateOfBirth", documentInfo.getDateOfBirth().toString());
            }
            
            request.put("gender", documentInfo.getGender());
            request.put("address", documentInfo.getAddress());
        }

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
                log.info("UserService notified: userId={}, sessionId={}", userId, sessionId);
            } else {
                log.warn("UserService returned status: {}", response.getStatusCode());
            }
        } catch (Exception e) {
            log.error("Failed to notify UserService: userId={}, error={}", userId, e.getMessage());
            // Don't throw exception - eKYC is still valid even if notification fails
        }
    }

    /**
     * Check if citizenId belongs to another user
     * Used to validate duplicate citizenId before completing eKYC
     * 
     * @param citizenId The citizenId to check
     * @param currentUserId The current user's ID (to exclude from check)
     * @return true if citizenId belongs to another user, false otherwise
     */
    public boolean checkCitizenIdDuplicate(String citizenId, Long currentUserId) {
        String url = userServiceUrl + "/user/check-citizenid?citizenId=" + citizenId + "&currentUserId=" + currentUserId;

        try {
            ResponseEntity<Boolean> response = restTemplate.getForEntity(url, Boolean.class);
            
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                boolean isDuplicate = response.getBody();
                log.info("CitizenId check: citizenId={}, currentUserId={}, isDuplicate={}", 
                    citizenId, currentUserId, isDuplicate);
                return isDuplicate;
            }
            
            log.warn("UserService returned unexpected status: {}", response.getStatusCode());
            return false; // Default to allow if service is unavailable
        } catch (Exception e) {
            log.error("Failed to check citizenId duplicate: citizenId={}, error={}", citizenId, e.getMessage());
            return false; // Default to allow if service is unavailable
        }
    }
}
