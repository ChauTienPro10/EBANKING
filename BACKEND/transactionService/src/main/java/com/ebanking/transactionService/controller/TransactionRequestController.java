package com.ebanking.transactionService.controller;

import com.ebanking.transactionService.dto.*;
import com.ebanking.transactionService.service.TransactionRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transaction-requests")
@RequiredArgsConstructor
@Slf4j
public class TransactionRequestController {

    private final TransactionRequestService transactionRequestService;

    @PostMapping("/cash")
    public ResponseEntity<TransactionRequestDto> createCashTransactionRequest(@RequestBody CashTransactionRequest request) {
        try {
            log.info("Creating cash transaction request for user: {}, type: {}", 
                    request.getUserId(), request.getRequestType());
            
            TransactionRequestDto result = transactionRequestService.createCashTransactionRequest(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error creating cash transaction request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<TransactionRequestDto>> getUserTransactionRequests(@PathVariable Long userId) {
        try {
            List<TransactionRequestDto> requests = transactionRequestService.getUserTransactionRequests(userId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            log.error("Error getting user transaction requests: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/pending")
    public ResponseEntity<List<TransactionRequestDto>> getPendingRequests() {
        try {
            List<TransactionRequestDto> requests = transactionRequestService.getPendingRequests();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            log.error("Error getting pending requests: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{requestNumber}")
    public ResponseEntity<TransactionRequestDto> getRequestByNumber(@PathVariable String requestNumber) {
        try {
            return transactionRequestService.getRequestByNumber(requestNumber)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error getting transaction request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{requestId}/approve")
    public ResponseEntity<TransactionRequestDto> approveRequest(
            @PathVariable Long requestId,
            @RequestParam String adminUsername) {
        try {
            log.info("Approving request: {} by admin: {}", requestId, adminUsername);
            TransactionRequestDto result = transactionRequestService.approveRequest(requestId, adminUsername);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error approving request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{requestId}/reject")
    public ResponseEntity<TransactionRequestDto> rejectRequest(
            @PathVariable Long requestId,
            @RequestParam String adminUsername,
            @RequestParam String rejectionReason) {
        try {
            log.info("Rejecting request: {} by admin: {}", requestId, adminUsername);
            TransactionRequestDto result = transactionRequestService.rejectRequest(requestId, adminUsername, rejectionReason);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("Error rejecting request: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }
}