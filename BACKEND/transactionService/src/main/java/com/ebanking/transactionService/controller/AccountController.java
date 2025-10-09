package com.ebanking.transactionService.controller;

import com.ebanking.transactionService.entity.Account;
import com.ebanking.transactionService.repository.AccountRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/accounts")
@Slf4j
public class AccountController {

    @Autowired
    private AccountRepository accountRepository;

   //get userId by account number
    @GetMapping("/{accountNumber}/user-id")
    public ResponseEntity<?> getUserIdByAccountNumber(@PathVariable String accountNumber) {
        try {
            Account account = accountRepository.findByAccountNumber(accountNumber);
            
            if (account == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Account not found");
                error.put("accountNumber", accountNumber);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("userId", account.getUserId());
            response.put("accountNumber", accountNumber);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error getting userId for account {}: {}", accountNumber, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
//get account info by account number
    @GetMapping("/{accountNumber}")
    public ResponseEntity<?> getAccountInfo(@PathVariable String accountNumber) {
        try {
            Account account = accountRepository.findByAccountNumber(accountNumber);
            
            if (account == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Account not found");
                error.put("accountNumber", accountNumber);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            return ResponseEntity.ok(account);
            
        } catch (Exception e) {
            log.error("Error getting account {}: {}", accountNumber, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    //check if account exist
    @GetMapping("/{accountNumber}/exists")
    public ResponseEntity<?> accountExists(@PathVariable String accountNumber) {
        try {
            Account account = accountRepository.findByAccountNumber(accountNumber);
            
            Map<String, Object> response = new HashMap<>();
            response.put("accountNumber", accountNumber);
            response.put("exists", account != null);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error checking account {}: {}", accountNumber, e.getMessage());
            Map<String, String> error = new HashMap<>();
            error.put("error", "Internal server error");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}

