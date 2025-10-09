package com.ebanking.firebaseService.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Optional;

@Component
@Slf4j
public class AccountLookupClient {

    @Value("${transaction.service.host:localhost}")
    private String transactionServiceHost;
    
    @Value("${transaction.service.port:8002}")
    private int transactionServicePort;
    
    private final RestTemplate restTemplate;
    
    public AccountLookupClient() {
        this.restTemplate = new RestTemplate();
    }

  //lấy userId từ account number via REST API
    public Optional<Long> getUserIdByAccountNumber(String accountNumber) {
        if (accountNumber == null || accountNumber.trim().isEmpty()) {
            return Optional.empty();
        }
        
        try {
            String url = String.format("http://%s:%d/api/accounts/%s/user-id", 
                transactionServiceHost, transactionServicePort, accountNumber);
            
            Long userId = restTemplate.getForObject(url, Long.class);
            log.debug("Found userId {} for account {} via TransactionService", userId, accountNumber);
            return Optional.ofNullable(userId);
            
        } catch (HttpClientErrorException.NotFound e) {
            log.warn("Account {} not found in TransactionService", accountNumber);
            return Optional.empty();
        } catch (Exception e) {
            log.error("Error calling TransactionService for account {}: {}", accountNumber, e.getMessage());
            return Optional.empty();
        }
    }
    
    //verify account exist
    public boolean accountExists(String accountNumber) {
        return getUserIdByAccountNumber(accountNumber).isPresent();
    }
}

