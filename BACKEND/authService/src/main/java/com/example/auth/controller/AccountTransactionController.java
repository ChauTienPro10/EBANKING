package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.dto.request.CheckAccountNumberRequest;
import com.example.auth.dto.request.NewAccountRequest;
import com.example.auth.dto.response.AccountResponse;
import com.example.auth.dto.response.CheckAccountNumberResponse;
import com.example.auth.dto.response.NewAccountResponse;
import com.example.auth.services.AccountTransactionService;
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
@RequestMapping(IURL.ACCOUNT_TRANS)
@Slf4j
public class AccountTransactionController {
    @Autowired
    AccountTransactionService accountTransactionService;

    @Autowired
    AuthenticationService authenticationService;

    @Autowired
    private HttpUltils httpUtils;

    @Autowired
    private SecurityUtils securityUtils;

    @Value("${service.trans.url:http://localhost:8003}")
    private String transactionServiceUrl;

    @PostMapping(IURL.OPEN_ACC_TRANS)
    public ResponseEntity<NewAccountResponse> openAccount(@RequestHeader("Authorization") String authHeader,
                                                          @RequestBody NewAccountRequest r)
            throws AuthenticationException {

        String jwt = authHeader.replace("Bearer ", "").trim();
        if(!authenticationService.checkValidUser(jwt, r.getUserId())) {
            throw new AuthenticationException("Bạn không có quyền thao tác");
        }
        return ResponseEntity.status(HttpStatus.OK).body(accountTransactionService.newAccount(r));
    }

    @GetMapping("/info/{userId}")
    public ResponseEntity<AccountResponse> getAccountInfo(@RequestHeader("Authorization") String authHeader,
                                                          @PathVariable("userId") Long userId) {
        log.info("GET:::/info/" + userId);
        return ResponseEntity.status(HttpStatus.OK).body(accountTransactionService.getAccountInfo(userId));
    }

    @PostMapping("/checkAccountNumber")
    public ResponseEntity<CheckAccountNumberResponse> checkAccountNumber(@RequestBody CheckAccountNumberRequest r) {
        log.info("GET:::/checkAccountNumber/" + r.getAccountNumber());
        return ResponseEntity.status(HttpStatus.OK).body(accountTransactionService.checkAccountExist(r));
    }

    /**
     * Get userId by account number
     * GET /authService/trans/account/{accountNumber}/user-id
     */
    @GetMapping("/{accountNumber}/user-id")
    public ResponseEntity<?> getUserIdByAccountNumber(@PathVariable String accountNumber) {
        try {
            log.info("Getting userId for account: {}", accountNumber);

            String url = transactionServiceUrl + "/api/accounts/" + accountNumber + "/user-id";
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting userId for account {}: {}", accountNumber, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get account info by account number
     * GET /authService/trans/account/{accountNumber}
     */
    @GetMapping("/{accountNumber}")
    public ResponseEntity<?> getAccountInfoByNumber(@PathVariable String accountNumber) {
        try {
            log.info("Getting account info for: {}", accountNumber);

            String url = transactionServiceUrl + "/api/accounts/" + accountNumber;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting account {}: {}", accountNumber, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get account info DTO by account number
     * GET /authService/trans/account/dto/{accountNumber}
     */
    @GetMapping("/dto/{accountNumber}")
    public ResponseEntity<?> getAccountInfoDto(@PathVariable String accountNumber) {
        try {
            log.info("Getting account DTO for: {}", accountNumber);

            String url = transactionServiceUrl + "/api/accounts/dto/" + accountNumber;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting account DTO {}: {}", accountNumber, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Check if account exists
     * GET /authService/trans/account/{accountNumber}/exists
     */
    @GetMapping("/{accountNumber}/exists")
    public ResponseEntity<?> accountExists(@PathVariable String accountNumber) {
        try {
            log.info("Checking if account exists: {}", accountNumber);

            String url = transactionServiceUrl + "/api/accounts/" + accountNumber + "/exists";
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error checking account {}: {}", accountNumber, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Check if face authentication is required
     * POST /authService/trans/account/check-face-auth
     */
    @PostMapping("/check-face-auth")
    public ResponseEntity<?> checkFaceAuthRequired(
            @RequestHeader Map<String, String> headers,
            @RequestParam Long userId,
            @RequestParam String username,
            @RequestParam String amount) {
        try {
            if (!securityUtils.checkUser(headers, username)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            log.info("Checking face auth required for user {}: {}", username, amount);

            String url = transactionServiceUrl + "/api/accounts/check-face-auth?userId=" + userId + "&username=" + username + "&amount=" + amount;
            Object response = httpUtils.post(url, null, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error checking face auth: {}", e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
