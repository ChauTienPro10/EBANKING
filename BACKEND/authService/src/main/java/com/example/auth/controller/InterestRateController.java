package com.example.auth.controller;

import com.example.auth.consts.IURL;
import com.example.auth.utils.HttpUltils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping(IURL.HOST_PREFIX + "/interest-rates")
@Slf4j
public class InterestRateController {

    @Autowired
    private HttpUltils httpUtils;

    @Value("${service.trans.url:http://3.85.17.154:8003}")
    private String transactionServiceUrl;

    /**
     * Get active interest rates
     * GET /authService/interest-rates/active
     */
    @GetMapping("/active")
    public ResponseEntity<?> getActiveInterestRates() {
        try {
            log.info("Getting active interest rates");

            String url = transactionServiceUrl + "/api/interest-rates/active";
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting active interest rates: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get all interest rates
     * GET /authService/interest-rates
     */
    @GetMapping
    public ResponseEntity<?> getAllInterestRates() {
        try {
            log.info("Getting all interest rates");

            String url = transactionServiceUrl + "/api/interest-rates";
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting all interest rates: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get interest rate by ID
     * GET /authService/interest-rates/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getInterestRateById(@PathVariable Long id) {
        try {
            log.info("Getting interest rate: {}", id);

            String url = transactionServiceUrl + "/api/interest-rates/" + id;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting interest rate: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Find applicable interest rate
     * GET /authService/interest-rates/applicable
     */
    @GetMapping("/applicable")
    public ResponseEntity<?> findApplicableRate(
            @RequestParam Integer termMonths,
            @RequestParam BigDecimal amount) {
        try {
            log.info("Finding applicable rate for term: {} months, amount: {}", termMonths, amount);

            String url = transactionServiceUrl + "/api/interest-rates/applicable?termMonths=" + termMonths + "&amount="
                    + amount;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error finding applicable rate: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * Get interest rates by term
     * GET /authService/interest-rates/term/{termMonths}
     */
    @GetMapping("/term/{termMonths}")
    public ResponseEntity<?> getInterestRatesByTerm(@PathVariable Integer termMonths) {
        try {
            log.info("Getting interest rates for term: {} months", termMonths);

            String url = transactionServiceUrl + "/api/interest-rates/term/" + termMonths;
            Object response = httpUtils.get(url, Object.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting interest rates by term: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}