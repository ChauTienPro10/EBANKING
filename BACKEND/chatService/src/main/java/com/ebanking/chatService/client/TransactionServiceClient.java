package com.ebanking.chatService.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@Slf4j
public class TransactionServiceClient {
    
    @Value("${services.transaction-service.url:http://localhost:8003}")
    private String transactionServiceUrl;
    
    private final RestTemplate restTemplate;
    
    public TransactionServiceClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }
    
    /**
     * Get userId by account number
     * @param accountNumber the account number
     * @return userId or null if not found
     */
    public Long getUserIdByAccountNumber(String accountNumber) {
        try {
            String url = transactionServiceUrl + "/api/accounts/" + accountNumber + "/user-id";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            if (response != null && response.containsKey("userId")) {
                Object userIdObj = response.get("userId");
                if (userIdObj instanceof Number) {
                    return ((Number) userIdObj).longValue();
                }
            }
            return null;
        } catch (Exception e) {
            log.error("Failed to get userId for account {}: {}", accountNumber, e.getMessage());
            return null;
        }
    }
}
