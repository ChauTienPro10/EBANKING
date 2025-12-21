package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.utils.HttpUltils;
import com.example.auth.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping(IURL.HOST_PREFIX + "/savings-transfers")
@Slf4j
public class SavingsTransferController {

    @Autowired
    private HttpUltils httpUtils;

    @Autowired
    private SecurityUtils securityUtils;

    @Value("${service.trans.url:http://localhost:8003}")
    private String transactionServiceUrl;

    /**
     * Transfer from payment account to savings account
     * POST /authService/savings-transfers/payment-to-savings
     */
    @PostMapping("/payment-to-savings")
    public ResponseEntity<?> transferFromPaymentToSavings(
            @RequestHeader Map<String, String> headers,
            @RequestBody Map<String, Object> request) {
        try {
            String username = (String) request.get("username");
            
            if (!securityUtils.checkUser(headers, username)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            log.info("Transfer from payment to savings for user: {}", username);

            String url = transactionServiceUrl + "/api/savings-transfers/payment-to-savings";
            String response = httpUtils.post(url, request, String.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in payment to savings transfer: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Transfer failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Transfer from savings account to payment account
     * POST /authService/savings-transfers/savings-to-payment
     */
    @PostMapping("/savings-to-payment")
    public ResponseEntity<?> transferFromSavingsToPayment(
            @RequestHeader Map<String, String> headers,
            @RequestBody Map<String, Object> request) {
        try {
            String username = (String) request.get("username");
            
            if (!securityUtils.checkUser(headers, username)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }

            log.info("Transfer from savings to payment for user: {}", username);

            String url = transactionServiceUrl + "/api/savings-transfers/savings-to-payment";
            String response = httpUtils.post(url, request, String.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error in savings to payment transfer: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Transfer failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}