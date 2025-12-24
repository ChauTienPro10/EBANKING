package com.ebanking.transactionService.controller;

import com.ebanking.transactionService.dto.DataPackageDto;
import com.ebanking.transactionService.dto.DataTopUpRequest;
import com.ebanking.transactionService.dto.DataTopUpResponse;
import com.ebanking.transactionService.exception.TransactionException;
import com.ebanking.transactionService.service.DataPackageService;
import com.ebanking.transactionService.service.DataTopUpService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/data-topup")
@RequiredArgsConstructor
@Slf4j
public class DataTopUpController {

    private final DataTopUpService dataTopUpService;
    private final DataPackageService dataPackageService;

    @GetMapping("/packages")
    public ResponseEntity<List<DataPackageDto>> getAllDataPackages() {
        log.info("Getting all data packages");
        List<DataPackageDto> packages = dataPackageService.getAllActivePackages();
        return ResponseEntity.ok(packages);
    }

    @GetMapping("/packages/provider/{providerId}")
    public ResponseEntity<List<DataPackageDto>> getDataPackagesByProvider(@PathVariable Long providerId) {
        log.info("Getting data packages for provider: {}", providerId);
        List<DataPackageDto> packages = dataPackageService.getPackagesByProvider(providerId);
        return ResponseEntity.ok(packages);
    }

    @GetMapping("/packages/provider-code/{providerCode}")
    public ResponseEntity<List<DataPackageDto>> getDataPackagesByProviderCode(@PathVariable String providerCode) {
        log.info("Getting data packages for provider code: {}", providerCode);
        List<DataPackageDto> packages = dataPackageService.getPackagesByProviderCode(providerCode);
        return ResponseEntity.ok(packages);
    }

    @GetMapping("/packages/{packageId}")
    public ResponseEntity<DataPackageDto> getDataPackageById(@PathVariable Long packageId) {
        log.info("Getting data package by ID: {}", packageId);
        return dataPackageService.getPackageById(packageId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/packages/code/{packageCode}")
    public ResponseEntity<DataPackageDto> getDataPackageByCode(@PathVariable String packageCode) {
        log.info("Getting data package by code: {}", packageCode);
        return dataPackageService.getPackageByCode(packageCode)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/packages/provider/{providerId}/price-range")
    public ResponseEntity<List<DataPackageDto>> getDataPackagesByPriceRange(
            @PathVariable Long providerId,
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice) {
        log.info("Getting data packages for provider {} with price range: {} - {}", providerId, minPrice, maxPrice);
        List<DataPackageDto> packages = dataPackageService.getPackagesByPriceRange(providerId, minPrice, maxPrice);
        return ResponseEntity.ok(packages);
    }

    @PostMapping("/initiate")
    public ResponseEntity<DataTopUpResponse> initiateDataTopUp(
            @Valid @RequestBody DataTopUpRequest request,
            @RequestHeader("User-ID") Long userId,
            @RequestHeader("Username") String username) throws TransactionException {
        log.info("Initiating data top-up for user: {} to phone: {}", userId, request.getPhoneNumber());
        
        DataTopUpResponse response = dataTopUpService.initiateDataTopUp(request, userId, username);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-face-auth")
    public ResponseEntity<DataTopUpResponse> verifyFaceAuthAndProcess(
            @RequestBody Map<String, String> request) throws TransactionException {
        String transactionId = request.get("transactionId");
        String faceAuthSessionId = request.get("faceAuthSessionId");
        
        log.info("Verifying face auth for data top-up: {}", transactionId);
        
        DataTopUpResponse response = dataTopUpService.verifyFaceAuthAndProcess(transactionId, faceAuthSessionId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transaction/{transactionId}")
    public ResponseEntity<DataTopUpResponse> getDataTopUpByTransactionId(@PathVariable String transactionId) {
        log.info("Getting data top-up by transaction ID: {}", transactionId);
        
        return dataTopUpService.getDataTopUpByTransactionId(transactionId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/history")
    public ResponseEntity<List<DataTopUpResponse>> getDataTopUpHistory(
            @RequestHeader("User-ID") Long userId) {
        log.info("Getting data top-up history for user: {}", userId);
        
        List<DataTopUpResponse> history = dataTopUpService.getDataTopUpHistory(userId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/history/paginated")
    public ResponseEntity<Page<DataTopUpResponse>> getDataTopUpHistoryPaginated(
            @RequestHeader("User-ID") Long userId,
            Pageable pageable) {
        log.info("Getting paginated data top-up history for user: {}", userId);
        
        Page<DataTopUpResponse> history = dataTopUpService.getDataTopUpHistory(userId, pageable);
        return ResponseEntity.ok(history);
    }
}