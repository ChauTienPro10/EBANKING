package com.example.auth.services;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AvatarService {

    @Autowired
    private RestTemplate restTemplate; // ✅ Inject bean, không new

    @Value("${services.user.url:http://3.85.17.154:8001}")
    private String userServiceUrl; // ✅ Extract URL từ config

    /**
     * Proxy avatar upload to UserService via HTTP
     */
    public ResponseEntity<?> uploadAvatar(Long userId, String imageBase64) {
        try {
            String url = userServiceUrl + "/user/" + userId + "/avatar";

            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("imageBase64", imageBase64);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

            log.info("Uploading avatar for user {} to UserService", userId);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            log.info("Avatar upload successful for user {}", userId);
            return response;
        } catch (Exception e) {
            log.error("Failed to upload avatar for user {}: {}", userId, e.getMessage());
            return ResponseEntity.badRequest().body("Failed to upload avatar: " + e.getMessage());
        }
    }

    /**
     * Proxy avatar delete to UserService via HTTP
     */
    public ResponseEntity<Void> deleteAvatar(Long userId) {
        try {
            String url = userServiceUrl + "/user/" + userId + "/avatar";

            log.info("Deleting avatar for user {} from UserService", userId);
            restTemplate.delete(url);

            log.info("Avatar delete successful for user {}", userId);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to delete avatar for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Proxy avatar get to UserService via HTTP
     */
    public ResponseEntity<?> getAvatar(Long userId) {
        try {
            String url = userServiceUrl + "/user/" + userId + "/avatar";

            log.info("Getting avatar for user {} from UserService", userId);
            byte[] imageBytes = restTemplate.getForObject(url, byte[].class);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(imageBytes);
        } catch (Exception e) {
            log.error("Failed to get avatar for user {}: {}", userId, e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
