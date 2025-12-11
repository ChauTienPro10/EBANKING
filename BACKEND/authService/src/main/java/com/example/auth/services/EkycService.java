package com.example.auth.services;

import com.example.auth.dto.response.*;
import com.example.auth.utils.HttpUltils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class EkycService {

    @Autowired
    private RestTemplate restTemplate;

    @Value("${services.ekyc.url:http://localhost:8008}")
    private String ekycServiceUrl;

    @Value("${services.transaction.url:http://localhost:8003}")
    private String transactionServiceUrl;

    /**
     * Check if face authentication is required for transaction
     * Forwards request to transactionService
     */
    public ResponseEntity<?> checkFaceAuthRequired(Long userId, String username, String amount) {
        try {
            String url = String.format("%s/api/accounts/check-face-auth?userId=%d&username=%s&amount=%s",
                    transactionServiceUrl, userId, username, amount);
            
            log.info("Forwarding face auth check to transactionService: {}", url);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            
            ResponseEntity<FaceAuthCheckResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    FaceAuthCheckResponse.class
            );
            
            log.info("Face auth check completed for user {}: required={}", username, response.getBody().getRequired());
            return ResponseEntity.ok(response.getBody());
            
        } catch (Exception e) {
            log.error("Error checking face auth for user {}: {}", username, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(FaceAuthCheckResponse.builder()
                            .required(false)
                            .message("Error checking face auth: " + e.getMessage())
                            .build());
        }
    }

    /**
     * Verify face authentication for transaction
     * Forwards request to ekycService
     */
    public ResponseEntity<?> verifyTransactionFaceAuth(Long userId, String sessionId, MultipartFile video) {
        try {
            String url = ekycServiceUrl + "/api/ekyc/verify-transaction";
            
            log.info("Forwarding face auth verification to ekycService for user {}, sessionId: {}", userId, sessionId);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("userId", userId);
            body.add("sessionId", sessionId);
            body.add("video", video.getResource());
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = 
                new HttpEntity<>(body, headers);
            
            ResponseEntity<ApiResponse<?>> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    requestEntity,
                    new ParameterizedTypeReference<ApiResponse<?>>() {}
            );
            
            log.info("Face auth verification completed for user {}", userId);
            return response;
            
        } catch (Exception e) {
            log.error("Error verifying face auth for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Face auth verification failed: " + e.getMessage()));
        }
    }

    /**
     * Link transaction ID to face auth verification
     * Forwards request to ekycService
     */
    public void linkTransactionToFaceAuth(String sessionId, Long transactionId) {
        String url = ekycServiceUrl + "/api/ekyc/link-transaction?sessionId=" + sessionId + "&transactionId=" + transactionId;
        
        try {
            restTemplate.postForEntity(url, null, Void.class);
            log.info("Successfully linked transaction {} to face auth session {}", transactionId, sessionId);
        } catch (Exception e) {
            log.error("Failed to link transaction to face auth: {}", e.getMessage());
        }
    }

    /**
     * Create eKYC session
     */
    public ResponseEntity<ApiResponse<SessionResponse>> createSession(Long userId) {
        try {
            String url = ekycServiceUrl + "/api/ekyc/sessions?userId=" + userId;
            
            log.info("Creating eKYC session for user {} via ekycService", userId);
            
            ResponseEntity<ApiResponse<SessionResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                null,
                new ParameterizedTypeReference<ApiResponse<SessionResponse>>() {}
            );
            
            log.info("eKYC session created successfully for user {}", userId);
            return response;
        } catch (Exception e) {
            log.error("Failed to create eKYC session for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create eKYC session"));
        }
    }

    /**
     * Get eKYC session
     */
    public ResponseEntity<ApiResponse<SessionResponse>> getSession(String sessionId, Long userId) {
        try {
            String url = ekycServiceUrl + "/api/ekyc/sessions/" + sessionId;
            
            log.info("Getting eKYC session {} for user {}", sessionId, userId);
            
            ResponseEntity<ApiResponse<SessionResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<ApiResponse<SessionResponse>>() {}
            );
            
            return response;
        } catch (Exception e) {
            log.error("Failed to get eKYC session {}: {}", sessionId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Session not found"));
        }
    }

    /**
     * Process OCR
     */
    public ResponseEntity<ApiResponse<OrcResponse>> processOcr(
            String sessionId, 
            MultipartFile frontImage, 
            MultipartFile backImage, 
            Long userId) {
        try {
            String url = ekycServiceUrl + "/api/ekyc/ocr";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("sessionId", sessionId);
            body.add("userId", userId);
            body.add("frontImage", frontImage.getResource());
            body.add("backImage", backImage.getResource());
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = 
                new HttpEntity<>(body, headers);
            
            log.info("Processing OCR for session {} user {}", sessionId, userId);
            
            ResponseEntity<ApiResponse<OrcResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                new ParameterizedTypeReference<ApiResponse<OrcResponse>>() {}
            );
            
            return response;
        } catch (Exception e) {
            log.error("Failed to process OCR for session {}: {}", sessionId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to process OCR"));
        }
    }

    /**
     * Process liveness
     */
    public ResponseEntity<ApiResponse<LivenessResponse>> processLiveness(
            String sessionId, 
            MultipartFile video, 
            Long userId) {
        try {
            String url = ekycServiceUrl + "/api/ekyc/liveness";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("sessionId", sessionId);
            body.add("userId", userId);
            body.add("video", video.getResource());
            
            HttpEntity<MultiValueMap<String, Object>> requestEntity = 
                new HttpEntity<>(body, headers);
            
            log.info("Processing liveness for session {} user {}", sessionId, userId);
            
            ResponseEntity<ApiResponse<LivenessResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                requestEntity,
                new ParameterizedTypeReference<ApiResponse<LivenessResponse>>() {}
            );
            
            return response;
        } catch (Exception e) {
            log.error("Failed to process liveness for session {}: {}", sessionId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to process liveness"));
        }
    }

    /**
     * Process face match
     */
    public ResponseEntity<ApiResponse<FaceMatchResponse>> processFaceMatch(
            String sessionId, 
            Long userId) {
        try {
            String url = ekycServiceUrl + "/api/ekyc/face-match?sessionId=" + sessionId + "&userId=" + userId;
            
            log.info("Processing face match for session {} user {}", sessionId, userId);
            
            ResponseEntity<ApiResponse<FaceMatchResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.POST,
                null,
                new ParameterizedTypeReference<ApiResponse<FaceMatchResponse>>() {}
            );
            
            return response;
        } catch (Exception e) {
            log.error("Failed to process face match for session {}: {}", sessionId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to process face match"));
        }
    }

    /**
     * Get session details
     */
    public ResponseEntity<ApiResponse<EkycDetailResponse>> getSessionDetails(
            String sessionId, 
            Long userId) {
        try {
            String url = ekycServiceUrl + "/api/ekyc/sessions/" + sessionId + "/details";
            
            log.info("Getting eKYC details for session {} user {}", sessionId, userId);
            
            ResponseEntity<ApiResponse<EkycDetailResponse>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<ApiResponse<EkycDetailResponse>>() {}
            );
            
            return response;
        } catch (Exception e) {
            log.error("Failed to get eKYC details for session {}: {}", sessionId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("Session details not found"));
        }
    }
}
