package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.services.AuthenticationService;
import com.example.auth.utils.HttpUltils;
import com.example.auth.utils.SecurityUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.tomcat.websocket.AuthenticationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping(IURL.HOST_PREFIX + "/data-topup")
@Slf4j
public class DataTopUpController {

    @Autowired
    private HttpUltils httpUtils;

    @Autowired
    private AuthenticationService authenticationService;

    @Autowired
    private SecurityUtils securityUtils;

    @Value("${service.trans.url:http://localhost:8003}")
    private String transactionServiceUrl;

    /**
     * Get all active data packages
     * GET /authService/data-topup/packages
     */
    @GetMapping("/packages")
    public ResponseEntity<?> getAllDataPackages() {
        try {
            log.info("Getting all active data packages");

            String url = transactionServiceUrl + "/api/data-topup/packages";
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting data packages: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get data packages");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get data packages by provider ID
     * GET /authService/data-topup/packages/provider/{providerId}
     */
    @GetMapping("/packages/provider/{providerId}")
    public ResponseEntity<?> getDataPackagesByProvider(@PathVariable Long providerId) {
        try {
            log.info("Getting data packages for provider: {}", providerId);

            String url = transactionServiceUrl + "/api/data-topup/packages/provider/" + providerId;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting data packages by provider: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get data packages");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get data packages by provider code
     * GET /authService/data-topup/packages/provider-code/{providerCode}
     */
    @GetMapping("/packages/provider-code/{providerCode}")
    public ResponseEntity<?> getDataPackagesByProviderCode(@PathVariable String providerCode) {
        try {
            log.info("Getting data packages for provider code: {}", providerCode);

            String url = transactionServiceUrl + "/api/data-topup/packages/provider-code/" + providerCode;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting data packages by provider code: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get data packages");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get data package by ID
     * GET /authService/data-topup/packages/{packageId}
     */
    @GetMapping("/packages/{packageId}")
    public ResponseEntity<?> getDataPackageById(@PathVariable Long packageId) {
        try {
            log.info("Getting data package by ID: {}", packageId);

            String url = transactionServiceUrl + "/api/data-topup/packages/" + packageId;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting data package by ID: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get data package");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get data package by code
     * GET /authService/data-topup/packages/code/{packageCode}
     */
    @GetMapping("/packages/code/{packageCode}")
    public ResponseEntity<?> getDataPackageByCode(@PathVariable String packageCode) {
        try {
            log.info("Getting data package by code: {}", packageCode);

            String url = transactionServiceUrl + "/api/data-topup/packages/code/" + packageCode;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting data package by code: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get data package");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get data packages by price range
     * GET /authService/data-topup/packages/provider/{providerId}/price-range
     */
    @GetMapping("/packages/provider/{providerId}/price-range")
    public ResponseEntity<?> getDataPackagesByPriceRange(
            @PathVariable Long providerId,
            @RequestParam String minPrice,
            @RequestParam String maxPrice) {
        try {
            log.info("Getting data packages for provider {} with price range: {} - {}", providerId, minPrice, maxPrice);

            String url = transactionServiceUrl + "/api/data-topup/packages/provider/" + providerId + 
                        "/price-range?minPrice=" + minPrice + "&maxPrice=" + maxPrice;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting data packages by price range: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get data packages");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Initiate data top-up
     * POST /authService/data-topup/initiate
     */
    @PostMapping("/initiate")
    public ResponseEntity<?> initiateDataTopUp(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, Object> request) {
        try {
            String jwt = authHeader.replace("Bearer ", "").trim();
            String username = (String) request.get("username");
            Long userId = Long.valueOf(request.get("userId").toString());
            
            if (!authenticationService.checkValidUser(jwt, userId)) {
                throw new AuthenticationException("Bạn không có quyền thao tác");
            }

            log.info("Initiating data top-up for user: {}", username);

            // Add headers for transaction service
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-ID", userId.toString());
            headers.set("Username", username);
            headers.set("Content-Type", "application/json");

            String url = transactionServiceUrl + "/api/data-topup/initiate";
            ResponseEntity<Object> responseEntity = httpUtils.postWithHeaders(url, request, Object.class, headers);
            Object response = responseEntity.getBody();

            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error initiating data top-up: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Data top-up initiation failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Verify face authentication and process data top-up
     * POST /authService/data-topup/verify-face-auth
     */
    @PostMapping("/verify-face-auth")
    public ResponseEntity<?> verifyFaceAuthAndProcess(
            @RequestHeader Map<String, String> headers,
            @RequestBody Map<String, Object> request) {
        try {
            log.info("Verifying face auth for data top-up: {}", request.get("transactionId"));

            String url = transactionServiceUrl + "/api/data-topup/verify-face-auth";
            Object response = httpUtils.post(url, request, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error verifying face auth for data top-up: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Face auth verification failed");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get data top-up by transaction ID
     * GET /authService/data-topup/transaction/{transactionId}
     */
    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<?> getDataTopUpByTransactionId(
            @RequestHeader Map<String, String> headers,
            @PathVariable String transactionId) {
        try {
            log.info("Getting data top-up by transaction ID: {}", transactionId);

            String url = transactionServiceUrl + "/api/data-topup/transaction/" + transactionId;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting data top-up: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get data top-up");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get user's data top-up history
     * GET /authService/data-topup/history
     */
    @GetMapping("/history")
    public ResponseEntity<?> getDataTopUpHistory(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam Long userId) {
        try {
            String jwt = authHeader.replace("Bearer ", "").trim();
            
            if (!authenticationService.checkValidUser(jwt, userId)) {
                throw new AuthenticationException("Bạn không có quyền thao tác");
            }

            log.info("Getting data top-up history for user: {}", userId);

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-ID", userId.toString());

            String url = transactionServiceUrl + "/api/data-topup/history";
            ResponseEntity<Object> responseEntity = httpUtils.getWithHeaders(url, Object.class, headers);
            Object response = responseEntity.getBody();

            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error getting data top-up history: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get history");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get user's data top-up history with pagination
     * GET /authService/data-topup/history/paginated
     */
    @GetMapping("/history/paginated")
    public ResponseEntity<?> getDataTopUpHistoryPaginated(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        try {
            String jwt = authHeader.replace("Bearer ", "").trim();
            
            if (!authenticationService.checkValidUser(jwt, userId)) {
                throw new AuthenticationException("Bạn không có quyền thao tác");
            }

            log.info("Getting paginated data top-up history for user: {}", userId);

            HttpHeaders headers = new HttpHeaders();
            headers.set("User-ID", userId.toString());

            String url = transactionServiceUrl + "/api/data-topup/history/paginated" +
                        "?page=" + page + "&size=" + size + "&sort=" + sort;
            ResponseEntity<Object> responseEntity = httpUtils.getWithHeaders(url, Object.class, headers);
            Object response = responseEntity.getBody();

            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error getting paginated data top-up history: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to get history");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}