package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.services.AuthenticationService;
import com.example.auth.utils.HttpUltils;
import com.example.auth.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.websocket.AuthenticationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping(IURL.HOST_PREFIX + "/savings-accounts")
@Slf4j
public class SavingsAccountController {

    @Autowired
    private HttpUltils httpUtils;

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private SecurityUtils securityUtils;

    @Value("${service.trans.url:http://localhost:8003}")
    private String transactionServiceUrl;

    /**
     * Create savings account
     * POST /authService/savings-accounts
     */
    @PostMapping
    public ResponseEntity<?> createSavingsAccount(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String jwt = authHeader.replace("Bearer ", "").trim();
            
            if (!authenticationService.checkValidUser(jwt, userId)) {
                throw new AuthenticationException("Bạn không có quyền thao tác");
            }

            log.info("Creating savings account for user: {}", userId);

            String url = transactionServiceUrl + "/api/savings-accounts";
            Object response = httpUtils.post(url, request, Object.class);

            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating savings account: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get user savings accounts
     * GET /authService/savings-accounts/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserSavingsAccounts(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long userId) {
        try {
            String jwt = authHeader.replace("Bearer ", "").trim();
            
            if (!authenticationService.checkValidUser(jwt, userId)) {
                throw new AuthenticationException("Bạn không có quyền thao tác");
            }

            log.info("Getting savings accounts for user: {}", userId);

            String url = transactionServiceUrl + "/api/savings-accounts/user/" + userId;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error getting user savings accounts: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get savings account by account number
     * GET /authService/savings-accounts/account/{accountNumber}
     */
    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<?> getSavingsAccountByNumber(
            @RequestHeader Map<String, String> headers,
            @PathVariable String accountNumber) {
        try {
            log.info("Getting savings account: {}", accountNumber);

            String url = transactionServiceUrl + "/api/savings-accounts/account/" + accountNumber;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting savings account: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}