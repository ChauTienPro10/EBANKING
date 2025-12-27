package com.ebanking.transactionService.controller;

import com.ebanking.transactionService.dto.*;
import com.ebanking.transactionService.service.SpendingCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SpendingCategoryController {

    private final SpendingCategoryService categoryService;

    /**
     * Get all categories for the authenticated user
     * GET /api/categories
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getUserCategories(
            @RequestHeader("X-User-Id") Long userId) {
        try {
            log.info("GET /api/categories - userId: {}", userId);
            
            List<SpendingCategoryDto> categories = categoryService.getUserCategories(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("categories", categories);
            response.put("count", categories.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching categories for user: {}", userId, e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Unable to fetch categories", e.getMessage());
        }
    }

    /**
     * Create a new category
     * POST /api/categories
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> createCategory(
            @RequestHeader("X-User-Id") Long userId,
            @Valid @RequestBody CreateCategoryRequest request) {
        try {
            log.info("POST /api/categories - userId: {}, code: {}", userId, request.getCode());
            
            SpendingCategoryDto category = categoryService.createCategory(userId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("category", category);
            response.put("message", "Category created successfully");
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            log.warn("Validation error creating category: {}", e.getMessage());
            return buildErrorResponse(HttpStatus.BAD_REQUEST, 
                    "Validation error", e.getMessage());
        } catch (Exception e) {
            log.error("Error creating category for user: {}", userId, e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Unable to create category", e.getMessage());
        }
    }

    /**
     * Update an existing category
     * PUT /api/categories/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateCategory(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String id,
            @Valid @RequestBody UpdateCategoryRequest request) {
        try {
            log.info("PUT /api/categories/{} - userId: {}", id, userId);
            
            SpendingCategoryDto category = categoryService.updateCategory(userId, id, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("category", category);
            response.put("message", "Category updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Validation error updating category: {}", e.getMessage());
            return buildErrorResponse(HttpStatus.BAD_REQUEST, 
                    "Validation error", e.getMessage());
        } catch (Exception e) {
            log.error("Error updating category: {} for user: {}", id, userId, e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Unable to update category", e.getMessage());
        }
    }

    /**
     * Delete a category (soft delete)
     * DELETE /api/categories/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteCategory(
            @RequestHeader("X-User-Id") Long userId,
            @PathVariable String id) {
        try {
            log.info("DELETE /api/categories/{} - userId: {}", id, userId);
            
            categoryService.deleteCategory(userId, id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Category deleted successfully");
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.warn("Validation error deleting category: {}", e.getMessage());
            return buildErrorResponse(HttpStatus.BAD_REQUEST, 
                    "Validation error", e.getMessage());
        } catch (Exception e) {
            log.error("Error deleting category: {} for user: {}", id, userId, e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Unable to delete category", e.getMessage());
        }
    }

    /**
     * Initialize default categories for a user
     * POST /api/categories/initialize
     */
    @PostMapping("/initialize")
    public ResponseEntity<Map<String, Object>> initializeDefaultCategories(
            @RequestHeader("X-User-Id") Long userId) {
        try {
            log.info("POST /api/categories/initialize - userId: {}", userId);
            
            categoryService.initializeDefaultCategories(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Default categories initialized successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error initializing default categories for user: {}", userId, e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Unable to initialize default categories", e.getMessage());
        }
    }

    /**
     * Get category statistics for pie chart
     * GET /api/categories/statistics?period=month
     */
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getCategoryStatistics(
            @RequestHeader("X-User-Id") Long userId,
            @RequestHeader("X-Username") String username,
            @RequestParam(defaultValue = "month") String period) {
        try {
            log.info("GET /api/categories/statistics - userId: {}, period: {}", userId, period);
            
            List<CategoryStatisticsDto> statistics = categoryService
                    .getCategoryStatistics(userId, username, period);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("statistics", statistics);
            response.put("period", period);
            response.put("count", statistics.size());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching category statistics for user: {}", userId, e);
            return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR, 
                    "Unable to fetch category statistics", e.getMessage());
        }
    }

    // ==================== Helper Methods ====================

    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            HttpStatus status, String message, String details) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("success", false);
        errorResponse.put("error", status.getReasonPhrase());
        errorResponse.put("message", message);
        if (details != null && !details.isEmpty()) {
            errorResponse.put("details", details);
        }
        return ResponseEntity.status(status).body(errorResponse);
    }
}
