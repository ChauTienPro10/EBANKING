package com.ebanking.transactionService.controller;

import com.ebanking.transactionService.dto.TransferPurposeDto;
import com.ebanking.transactionService.service.TransferPurposeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/transfer")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TransferPurposeController {

    private final TransferPurposeService transferPurposeService;

    @GetMapping("/purposes")
    public ResponseEntity<Map<String, Object>> getTransferPurposes() {
        try {
            List<TransferPurposeDto> purposes = transferPurposeService.getAllActivePurposes();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("purposes", purposes);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching transfer purposes", e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", "Internal server error");
            errorResponse.put("message", "Unable to fetch transfer purposes");
            
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}