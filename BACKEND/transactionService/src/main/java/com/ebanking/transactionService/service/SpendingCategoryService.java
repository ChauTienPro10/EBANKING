package com.ebanking.transactionService.service;

import com.ebanking.transactionService.dto.*;
import com.ebanking.transactionService.entity.SpendingCategory;
import com.ebanking.transactionService.entity.Transaction;
import com.ebanking.transactionService.repository.SpendingCategoryRepository;
import com.ebanking.transactionService.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SpendingCategoryService {

    private final SpendingCategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    /**
     * Get all active categories for a user
     */
    public List<SpendingCategoryDto> getUserCategories(Long userId) {
        try {
            log.info("Fetching categories for user: {}", userId);
            List<SpendingCategory> categories = categoryRepository
                    .findByUserIdAndIsActiveOrderByNameAsc(userId, true);
            
            return categories.stream()
                    .map(this::convertToDto)
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error fetching categories for user: {}", userId, e);
            throw new RuntimeException("Unable to fetch categories");
        }
    }

    /**
     * Create a new category for a user
     */
    @Transactional
    public SpendingCategoryDto createCategory(Long userId, CreateCategoryRequest request) {
        try {
            log.info("Creating category for user: {}, code: {}", userId, request.getCode());
            
            // Check if an inactive category with this code exists
            Optional<SpendingCategory> existingInactive = categoryRepository
                    .findByUserIdAndCode(userId, request.getCode())
                    .filter(cat -> !cat.getIsActive());
            
            if (existingInactive.isPresent()) {
                // Reactivate existing category instead of creating new one
                log.info("Found inactive category with code {}, reactivating instead of creating new", request.getCode());
                SpendingCategory category = existingInactive.get();
                
                // Update with new values
                category.setName(request.getName());
                category.setIcon(request.getIcon() != null ? request.getIcon() : category.getIcon());
                category.setColor(request.getColor() != null ? request.getColor() : category.getColor());
                category.setIsActive(true);
                category.setIsDefault(false); // User-created categories are not default
                
                SpendingCategory reactivated = categoryRepository.save(category);
                log.info("Category reactivated successfully: {}", reactivated.getId());
                
                return convertToDto(reactivated);
            }
            
            // Validate: Check if code already exists for this user (among ACTIVE categories only)
            if (categoryRepository.existsByUserIdAndCodeAndIsActive(userId, request.getCode(), true)) {
                throw new IllegalArgumentException("Category code already exists: " + request.getCode());
            }
            
            // Create new category
            SpendingCategory category = SpendingCategory.builder()
                    .userId(userId)
                    .name(request.getName())
                    .code(request.getCode().toUpperCase())
                    .icon(request.getIcon() != null ? request.getIcon() : "📝")
                    .color(request.getColor() != null ? request.getColor() : "#4ECDC4")
                    .isActive(true)
                    .isDefault(false)
                    .build();
            
            SpendingCategory saved = categoryRepository.save(category);
            log.info("Category created successfully: {}", saved.getId());
            
            return convertToDto(saved);
        } catch (IllegalArgumentException e) {
            log.warn("Validation error creating category: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error creating category for user: {}", userId, e);
            throw new RuntimeException("Unable to create category");
        }
    }

    /**
     * Update an existing category
     */
    @Transactional
    public SpendingCategoryDto updateCategory(Long userId, String categoryId, UpdateCategoryRequest request) {
        try {
            log.info("Updating category: {} for user: {}", categoryId, userId);
            
            // Find category and verify ownership
            SpendingCategory category = categoryRepository.findByUserIdAndId(userId, categoryId)
                    .orElseThrow(() -> new IllegalArgumentException("Category not found or access denied"));
            
            // Update fields if provided
            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                category.setName(request.getName());
            }
            if (request.getIcon() != null) {
                category.setIcon(request.getIcon());
            }
            if (request.getColor() != null) {
                category.setColor(request.getColor());
            }
            
            SpendingCategory updated = categoryRepository.save(category);
            log.info("Category updated successfully: {}", categoryId);
            
            return convertToDto(updated);
        } catch (IllegalArgumentException e) {
            log.warn("Validation error updating category: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error updating category: {} for user: {}", categoryId, userId, e);
            throw new RuntimeException("Unable to update category");
        }
    }

    /**
     * Delete a category (soft delete)
     */
    @Transactional
    public void deleteCategory(Long userId, String categoryId) {
        try {
            log.info("Deleting category: {} for user: {}", categoryId, userId);
            
            // Find category and verify ownership
            SpendingCategory category = categoryRepository.findByUserIdAndId(userId, categoryId)
                    .orElseThrow(() -> new IllegalArgumentException("Category not found or access denied"));
            
            // Prevent deletion of default categories
            if (Boolean.TRUE.equals(category.getIsDefault())) {
                throw new IllegalArgumentException("Cannot delete default categories");
            }
            
            // Soft delete
            category.setIsActive(false);
            categoryRepository.save(category);
            
            log.info("Category deleted successfully: {}", categoryId);
        } catch (IllegalArgumentException e) {
            log.warn("Validation error deleting category: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Error deleting category: {} for user: {}", categoryId, userId, e);
            throw new RuntimeException("Unable to delete category");
        }
    }

    /**
     * Initialize default categories for a new user
     */
    @Transactional
    public void initializeDefaultCategories(Long userId) {
        try {
            log.info("Initializing default categories for user: {}", userId);
            
            // Check if user already has categories
            long existingCount = categoryRepository.countByUserIdAndIsActive(userId, true);
            if (existingCount > 0) {
                log.info("User {} already has {} categories, skipping initialization", userId, existingCount);
                return;
            }
            
            // Create default categories
            List<SpendingCategory> defaultCategories = Arrays.asList(
                    createDefaultCategory(userId, "Mua sắm", "SHOPPING", "🛍️", "#FF6B6B"),
                    createDefaultCategory(userId, "Ăn uống", "FOOD", "🍽️", "#4ECDC4"),
                    createDefaultCategory(userId, "Đi chợ", "GROCERIES", "🛒", "#95E1D3"),
                    createDefaultCategory(userId, "Giải trí", "ENTERTAINMENT", "🎬", "#F38181"),
                    createDefaultCategory(userId, "Học phí", "EDUCATION", "🎓", "#AA96DA"),
                    createDefaultCategory(userId, "Y tế", "HEALTHCARE", "⚕️", "#FCBAD3"),
                    createDefaultCategory(userId, "Di chuyển", "TRANSPORT", "🚗", "#A8D8EA"),
                    createDefaultCategory(userId, "Hóa đơn", "BILLS", "📄", "#FFD93D"),
                    createDefaultCategory(userId, "Khác", "OTHER", "📝", "#C7CEEA")
            );
            
            categoryRepository.saveAll(defaultCategories);
            log.info("Default categories initialized successfully for user: {}", userId);
        } catch (Exception e) {
            log.error("Error initializing default categories for user: {}", userId, e);
            throw new RuntimeException("Unable to initialize default categories");
        }
    }

    /**
     * Get category statistics for pie chart
     */
    public List<CategoryStatisticsDto> getCategoryStatistics(Long userId, String username, String period) {
        try {
            log.info("Fetching category statistics for user: {}, period: {}", userId, period);
            
            // Calculate date range based on period
            LocalDateTime startDate = calculateStartDate(period);
            LocalDateTime endDate = LocalDateTime.now();
            
            // Get all transactions in the period for this user (outgoing only)
            List<Transaction> transactions = transactionRepository
                    .findBySenderAccountNumberAndTransactionAtBetween(
                            getUserAccountNumber(username), 
                            startDate, 
                            endDate
                    );
            
            // Filter successful transactions with categories
            Map<String, List<Transaction>> transactionsByCategory = transactions.stream()
                    .filter(t -> "SUCCESS".equals(t.getStatus()))
                    .filter(t -> t.getCategoryId() != null && !t.getCategoryId().isEmpty())
                    .collect(Collectors.groupingBy(Transaction::getCategoryId));
            
            // Calculate total amount for percentage calculation
            BigDecimal totalAmount = transactions.stream()
                    .filter(t -> "SUCCESS".equals(t.getStatus()))
                    .filter(t -> t.getCategoryId() != null)
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Build statistics for each category
            List<CategoryStatisticsDto> statistics = new ArrayList<>();
            
            for (Map.Entry<String, List<Transaction>> entry : transactionsByCategory.entrySet()) {
                String categoryId = entry.getKey();
                List<Transaction> categoryTransactions = entry.getValue();
                
                // Get category details
                Optional<SpendingCategory> categoryOpt = categoryRepository.findById(categoryId);
                if (categoryOpt.isEmpty()) continue;
                
                SpendingCategory category = categoryOpt.get();
                
                // Calculate statistics
                BigDecimal categoryTotal = categoryTransactions.stream()
                        .map(Transaction::getAmount)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                
                double percentage = totalAmount.compareTo(BigDecimal.ZERO) > 0
                        ? categoryTotal.divide(totalAmount, 4, RoundingMode.HALF_UP)
                                .multiply(BigDecimal.valueOf(100))
                                .doubleValue()
                        : 0.0;
                
                CategoryStatisticsDto stat = CategoryStatisticsDto.builder()
                        .categoryId(category.getId())
                        .categoryName(category.getName())
                        .categoryCode(category.getCode())
                        .categoryIcon(category.getIcon())
                        .categoryColor(category.getColor())
                        .totalAmount(categoryTotal)
                        .transactionCount((long) categoryTransactions.size())
                        .percentage(percentage)
                        .build();
                
                statistics.add(stat);
            }
            
            // Sort by total amount descending
            statistics.sort((a, b) -> b.getTotalAmount().compareTo(a.getTotalAmount()));
            
            log.info("Category statistics calculated: {} categories", statistics.size());
            return statistics;
            
        } catch (Exception e) {
            log.error("Error calculating category statistics for user: {}", userId, e);
            throw new RuntimeException("Unable to calculate category statistics");
        }
    }

    /**
     * Validate if a category belongs to a user
     */
    public boolean validateCategoryOwnership(Long userId, String categoryId) {
        if (categoryId == null || categoryId.isEmpty()) {
            return true; // Allow null category
        }
        return categoryRepository.findByUserIdAndId(userId, categoryId).isPresent();
    }

    // ==================== Helper Methods ====================

    private SpendingCategoryDto convertToDto(SpendingCategory category) {
        return SpendingCategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .code(category.getCode())
                .icon(category.getIcon())
                .color(category.getColor())
                .isDefault(category.getIsDefault())
                .build();
    }

    private SpendingCategory createDefaultCategory(Long userId, String name, String code, 
                                                   String icon, String color) {
        return SpendingCategory.builder()
                .userId(userId)
                .name(name)
                .code(code)
                .icon(icon)
                .color(color)
                .isActive(true)
                .isDefault(true)
                .build();
    }

    private LocalDateTime calculateStartDate(String period) {
        LocalDateTime now = LocalDateTime.now();
        return switch (period.toLowerCase()) {
            case "week" -> now.minusWeeks(1);
            case "month" -> now.minusMonths(1);
            case "year" -> now.minusYears(1);
            default -> now.minusMonths(1); // Default to month
        };
    }

    private String getUserAccountNumber(String username) {
        // This should be implemented based on your user service
        // For now, returning username as placeholder
        // TODO: Implement proper account number retrieval
        return username;
    }
}
