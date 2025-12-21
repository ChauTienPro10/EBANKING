package com.ebanking.transactionService.controller;

import com.ebanking.transactionService.dto.*;
import com.ebanking.transactionService.service.SavingsAccountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/savings-accounts")
@RequiredArgsConstructor
@Slf4j
public class SavingsAccountController {

    private final SavingsAccountService savingsAccountService;

    @PostMapping
    public ResponseEntity<SavingsAccountDto> createSavingsAccount(@RequestBody CreateSavingsAccountRequest request) {
        try {
            log.info("Creating savings account for user: {}", request.getUserId());
            SavingsAccountDto result = savingsAccountService.createSavingsAccount(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error creating savings account: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<SavingsAccountDto>> getUserSavingsAccounts(@PathVariable Long userId) {
        try {
            List<SavingsAccountDto> accounts = savingsAccountService.getUserSavingsAccounts(userId);
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            log.error("Error getting user savings accounts: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/account/{accountNumber}")
    public ResponseEntity<SavingsAccountDto> getSavingsAccountByNumber(@PathVariable String accountNumber) {
        try {
            return savingsAccountService.getSavingsAccountByNumber(accountNumber)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting savings account: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}