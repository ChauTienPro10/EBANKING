package com.ebanking.transactionService.controller;

import com.ebanking.transactionService.dto.InterestRateDto;
import com.ebanking.transactionService.service.InterestRateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/interest-rates")
@RequiredArgsConstructor
@Slf4j
public class InterestRateController {

    private final InterestRateService interestRateService;

    @GetMapping("/active")
    public ResponseEntity<List<InterestRateDto>> getActiveInterestRates() {
        try {
            List<InterestRateDto> rates = interestRateService.getActiveInterestRates();
            return ResponseEntity.ok(rates);
        } catch (Exception e) {
            log.error("Error getting active interest rates: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping
    public ResponseEntity<List<InterestRateDto>> getAllInterestRates() {
        try {
            List<InterestRateDto> rates = interestRateService.getAllInterestRates();
            return ResponseEntity.ok(rates);
        } catch (Exception e) {
            log.error("Error getting all interest rates: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterestRateDto> getInterestRateById(@PathVariable Long id) {
        try {
            return interestRateService.getInterestRateById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting interest rate: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/applicable")
    public ResponseEntity<InterestRateDto> findApplicableRate(
            @RequestParam Integer termMonths,
            @RequestParam BigDecimal amount) {
        try {
            return interestRateService.findApplicableRate(termMonths, amount)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error finding applicable rate: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/term/{termMonths}")
    public ResponseEntity<List<InterestRateDto>> getInterestRatesByTerm(@PathVariable Integer termMonths) {
        try {
            List<InterestRateDto> rates = interestRateService.getInterestRatesByTerm(termMonths);
            return ResponseEntity.ok(rates);
        } catch (Exception e) {
            log.error("Error getting interest rates by term: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}