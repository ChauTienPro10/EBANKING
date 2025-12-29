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
@RequestMapping(IURL.HOST_PREFIX + "/transaction-requests")
@Slf4j
public class TransactionRequestController {

    @Autowired
    private HttpUltils httpUtils;

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private SecurityUtils securityUtils;

    @Value("${service.trans.url:http://3.85.17.154:8003}")
    private String transactionServiceUrl;

    /**
     * Create cash transaction request
     * POST /authService/transaction-requests/cash
     */
    @PostMapping("/cash")
    public ResponseEntity<?> createCashTransactionRequest(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {
        try {
            Long userId = Long.valueOf(request.get("userId").toString());
            String jwt = authHeader.replace("Bearer ", "").trim();

            if (!authenticationService.checkValidUser(jwt, userId)) {
                throw new AuthenticationException("Bạn không có quyền thao tác");
            }

            log.info("Creating cash transaction request for user: {}", userId);

            String url = transactionServiceUrl + "/api/transaction-requests/cash";
            Object response = httpUtils.post(url, request, Object.class);

            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating cash transaction request: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get user transaction requests
     * GET /authService/transaction-requests/user/{userId}
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserTransactionRequests(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long userId) {
        try {
            String jwt = authHeader.replace("Bearer ", "").trim();

            if (!authenticationService.checkValidUser(jwt, userId)) {
                throw new AuthenticationException("Bạn không có quyền thao tác");
            }

            log.info("Getting transaction requests for user: {}", userId);

            String url = transactionServiceUrl + "/api/transaction-requests/user/" + userId;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error getting user transaction requests: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get pending transaction requests (admin only)
     * GET /authService/transaction-requests/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<?> getPendingRequests(@RequestHeader Map<String, String> headers) {
        try {
            log.info("Getting pending transaction requests");

            String url = transactionServiceUrl + "/api/transaction-requests/pending";
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting pending requests: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get transaction request by number
     * GET /authService/transaction-requests/{requestNumber}
     */
    @GetMapping("/{requestNumber}")
    public ResponseEntity<?> getRequestByNumber(
            @RequestHeader Map<String, String> headers,
            @PathVariable String requestNumber) {
        try {
            log.info("Getting transaction request: {}", requestNumber);

            String url = transactionServiceUrl + "/api/transaction-requests/" + requestNumber;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting transaction request: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Approve transaction request (admin only)
     * POST /authService/transaction-requests/{requestId}/approve
     */
    @PostMapping("/{requestId}/approve")
    public ResponseEntity<?> approveRequest(
            @RequestHeader Map<String, String> headers,
            @PathVariable Long requestId,
            @RequestParam String adminUsername) {
        try {
            log.info("Approving request: {} by admin: {}", requestId, adminUsername);

            String url = transactionServiceUrl + "/api/transaction-requests/" + requestId + "/approve?adminUsername="
                    + adminUsername;
            Object response = httpUtils.post(url, null, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error approving request: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Reject transaction request (admin only)
     * POST /authService/transaction-requests/{requestId}/reject
     */
    @PostMapping("/{requestId}/reject")
    public ResponseEntity<?> rejectRequest(
            @RequestHeader Map<String, String> headers,
            @PathVariable Long requestId,
            @RequestParam String adminUsername,
            @RequestParam String rejectionReason) {
        try {
            log.info("Rejecting request: {} by admin: {}", requestId, adminUsername);

            String url = transactionServiceUrl + "/api/transaction-requests/" + requestId + "/reject?adminUsername="
                    + adminUsername + "&rejectionReason=" + rejectionReason;
            Object response = httpUtils.post(url, null, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error rejecting request: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}