package com.ebanking.adminTool.controller;

import com.ebanking.adminTool.dto.TransactionRequestDto;
import com.ebanking.adminTool.dto.TransactionRequestFilterDto;
import com.ebanking.adminTool.dto.PagedResponseDto;
import com.ebanking.adminTool.service.TransactionRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TransactionRequestController {

    private final TransactionRequestService transactionRequestService;

    @GetMapping("/transaction-requests")
    public ResponseEntity<PagedResponseDto<TransactionRequestDto>> getTransactionRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String requestNumber,
            @RequestParam(required = false) BigDecimal minAmount,
            @RequestParam(required = false) BigDecimal maxAmount,
            @RequestParam(required = false) String requestType,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Long savingsAccountId,
            @RequestParam(required = false) String processedBy,
            @RequestParam(defaultValue = "created_at") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {
        
        try {
            log.info("Received request to fetch transaction requests - page: {}, size: {}, fromDate: {}, toDate: {}, status: {}, requestNumber: {}, minAmount: {}, maxAmount: {}", 
                    page, size, fromDate, toDate, status, requestNumber, minAmount, maxAmount);
            
            // Validate parameters
            if (page < 0) page = 0;
            if (size <= 0 || size > 1000) size = 20;
            if (!sortDirection.equalsIgnoreCase("ASC") && !sortDirection.equalsIgnoreCase("DESC")) {
                sortDirection = "DESC";
            }
            
            // Validate sortBy field
            String[] allowedSortFields = {"request_id", "created_at", "updated_at", "requested_at", "amount", "status", "request_type"};
            boolean validSortField = false;
            for (String field : allowedSortFields) {
                if (field.equals(sortBy)) {
                    validSortField = true;
                    break;
                }
            }
            if (!validSortField) {
                sortBy = "created_at";
            }
            
            // Create filter object
            TransactionRequestFilterDto filter = new TransactionRequestFilterDto();
            filter.setPage(page);
            filter.setSize(size);
            filter.setFromDate(fromDate);
            filter.setToDate(toDate);
            filter.setStatus(status);
            filter.setRequestNumber(requestNumber);
            filter.setMinAmount(minAmount);
            filter.setMaxAmount(maxAmount);
            filter.setRequestType(requestType);
            filter.setUserId(userId);
            filter.setSavingsAccountId(savingsAccountId);
            filter.setProcessedBy(processedBy);
            filter.setSortBy(sortBy);
            filter.setSortDirection(sortDirection);
            
            PagedResponseDto<TransactionRequestDto> result = transactionRequestService.getTransactionRequestsWithFilter(filter);
            
            log.info("Successfully fetched {} transaction requests out of {} total", 
                    result.getData().size(), result.getTotalElements());
            
            return ResponseEntity.ok(result);
            
        } catch (Exception e) {
            log.error("Error fetching transaction requests: {}", e.getMessage(), e);
            
            PagedResponseDto<TransactionRequestDto> errorResponse = new PagedResponseDto<>();
            errorResponse.setData(List.of());
            errorResponse.setTotalElements(0);
            errorResponse.setCurrentPage(page);
            errorResponse.setPageSize(size);
            errorResponse.setTotalPages(0);
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    // Legacy endpoint for backward compatibility
    @GetMapping("/transaction-requests/legacy")
    public ResponseEntity<Map<String, Object>> getTransactionRequestsLegacy(
            @RequestParam(defaultValue = "20") int size) {
        
        try {
            log.info("Received legacy request to fetch {} transaction requests", size);
            
            // Validate size parameter
            if (size <= 0 || size > 1000) {
                size = 20; // Default to 20 if invalid
            }
            
            List<TransactionRequestDto> transactionRequests = transactionRequestService.getTransactionRequests(size);
            long totalCount = transactionRequestService.getTotalTransactionRequests();
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", transactionRequests);
            response.put("total", totalCount);
            response.put("size", size);
            response.put("count", transactionRequests.size());
            
            log.info("Successfully fetched {} transaction requests out of {} total", 
                    transactionRequests.size(), totalCount);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching transaction requests: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch transaction requests");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("data", List.of());
            errorResponse.put("total", 0);
            errorResponse.put("size", size);
            errorResponse.put("count", 0);
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    // Stats endpoint - must be before {requestId} to avoid path conflict
    @GetMapping("/transaction-requests/stats")
    public ResponseEntity<Map<String, Object>> getTransactionRequestStats() {
        try {
            log.info("Received request to fetch transaction request statistics");
            
            long totalCount = transactionRequestService.getTotalTransactionRequests();
            
            // Get counts by status
            Map<String, Long> statusCounts = transactionRequestService.getCountsByStatus();
            
            // Get counts by request type
            Map<String, Long> typeCounts = transactionRequestService.getCountsByRequestType();
            
            Map<String, Object> response = new HashMap<>();
            response.put("totalRequests", totalCount);
            response.put("statusBreakdown", statusCounts);
            response.put("typeBreakdown", typeCounts);
            
            log.info("Successfully fetched transaction request statistics");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching transaction request statistics: {}", e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch statistics");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("totalRequests", 0);
            errorResponse.put("statusBreakdown", Map.of());
            errorResponse.put("typeBreakdown", Map.of());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/transaction-requests/{requestId}")
    public ResponseEntity<Map<String, Object>> getTransactionRequestById(@PathVariable Long requestId) {
        try {
            log.info("Received request to fetch transaction request with id: {}", requestId);
            
            TransactionRequestDto foundRequest = transactionRequestService.getTransactionRequestById(requestId);
            
            Map<String, Object> response = new HashMap<>();
            if (foundRequest != null) {
                response.put("data", foundRequest);
                response.put("found", true);
                return ResponseEntity.ok(response);
            } else {
                response.put("error", "Transaction request not found");
                response.put("found", false);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("Error fetching transaction request by id {}: {}", requestId, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch transaction request");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("found", false);
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/transaction-requests/{requestId}/approve")
    public ResponseEntity<Map<String, Object>> approveTransactionRequest(
            @PathVariable Long requestId,
            @RequestParam String adminUsername) {
        try {
            log.info("Received request to approve transaction request: {} by admin: {}", requestId, adminUsername);
            
            TransactionRequestDto approvedRequest = transactionRequestService.approveRequest(requestId, adminUsername);
            
            // Get updated balance
            BigDecimal newBalance = transactionRequestService.getSavingsAccountBalance(approvedRequest.getSavingsAccountId());
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", approvedRequest);
            response.put("success", true);
            response.put("message", "Transaction request approved successfully");
            response.put("newBalance", newBalance);
            response.put("transactionType", approvedRequest.getRequestType());
            response.put("amount", approvedRequest.getAmount());
            
            log.info("Successfully approved transaction request: {} by admin: {} - New balance: {}", 
                    requestId, adminUsername, newBalance);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error approving transaction request {}: {}", requestId, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to approve transaction request");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("success", false);
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @PostMapping("/transaction-requests/{requestId}/reject")
    public ResponseEntity<Map<String, Object>> rejectTransactionRequest(
            @PathVariable Long requestId,
            @RequestParam String adminUsername,
            @RequestParam String rejectionReason) {
        try {
            log.info("Received request to reject transaction request: {} by admin: {} with reason: {}", 
                    requestId, adminUsername, rejectionReason);
            
            TransactionRequestDto rejectedRequest = transactionRequestService.rejectRequest(requestId, adminUsername, rejectionReason);
            
            Map<String, Object> response = new HashMap<>();
            response.put("data", rejectedRequest);
            response.put("success", true);
            response.put("message", "Transaction request rejected successfully");
            
            log.info("Successfully rejected transaction request: {} by admin: {}", requestId, adminUsername);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error rejecting transaction request {}: {}", requestId, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to reject transaction request");
            errorResponse.put("message", e.getMessage());
            errorResponse.put("success", false);
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/savings-accounts/{savingsAccountId}/balance")
    public ResponseEntity<Map<String, Object>> getSavingsAccountBalance(@PathVariable Long savingsAccountId) {
        try {
            log.info("Received request to fetch balance for savings account: {}", savingsAccountId);
            
            BigDecimal balance = transactionRequestService.getSavingsAccountBalance(savingsAccountId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("savingsAccountId", savingsAccountId);
            response.put("balance", balance);
            response.put("currency", "VND");
            
            log.info("Successfully fetched balance for savings account {}: {}", savingsAccountId, balance);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("Error fetching balance for savings account {}: {}", savingsAccountId, e.getMessage(), e);
            
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Failed to fetch savings account balance");
            errorResponse.put("message", e.getMessage());
            
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}