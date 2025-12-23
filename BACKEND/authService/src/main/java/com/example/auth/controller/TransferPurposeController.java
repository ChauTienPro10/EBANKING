package com.example.auth.controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("authService/transfer")
@Slf4j
@CrossOrigin(origins = "*")
public class TransferPurposeController {

    @Value("${service.trans.url}")
    private String transactionServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/purposes")
    public ResponseEntity<Map<String, Object>> getTransferPurposes() {
        try {
            log.info("Proxying transfer purposes request to transaction service");
            
            String url = transactionServiceUrl + "/transfer/purposes";
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            
            return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
            
        } catch (Exception e) {
            log.error("Error proxying transfer purposes request", e);
            
            Map<String, Object> errorResponse = Map.of(
                "success", false,
                "error", "Internal server error",
                "message", "Unable to fetch transfer purposes"
            );
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}