package com.ebanking.transactionService.controller;

import com.ebanking.transactionService.dto.TransferRequest;
import com.ebanking.transactionService.service.SavingsTransferService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/savings-transfers")
@RequiredArgsConstructor
@Slf4j
public class SavingsTransferController {

    private final SavingsTransferService savingsTransferService;

    @PostMapping("/payment-to-savings")
    public ResponseEntity<String> transferFromPaymentToSavings(@RequestBody TransferRequest request) {
        try {
            log.info("Transfer from payment to savings: {} -> {}", 
                    request.getFromAccountNumber(), request.getToAccountNumber());
            
            request.setTransferType("PAYMENT_TO_SAVINGS");
            savingsTransferService.transferFromPaymentToSavings(request);
            
            return ResponseEntity.ok("Transfer completed successfully");
        } catch (Exception e) {
            log.error("Error in payment to savings transfer: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Transfer failed: " + e.getMessage());
        }
    }

    @PostMapping("/savings-to-payment")
    public ResponseEntity<String> transferFromSavingsToPayment(@RequestBody TransferRequest request) {
        try {
            log.info("Transfer from savings to payment: {} -> {}", 
                    request.getFromAccountNumber(), request.getToAccountNumber());
            
            request.setTransferType("SAVINGS_TO_PAYMENT");
            savingsTransferService.transferFromSavingsToPayment(request);
            
            return ResponseEntity.ok("Transfer completed successfully");
        } catch (Exception e) {
            log.error("Error in savings to payment transfer: {}", e.getMessage());
            return ResponseEntity.badRequest().body("Transfer failed: " + e.getMessage());
        }
    }
}