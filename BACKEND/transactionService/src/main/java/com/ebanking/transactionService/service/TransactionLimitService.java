package com.ebanking.transactionService.service;

import com.ebanking.transactionService.dto.TransactionLimitRequest;
import com.ebanking.transactionService.dto.TransactionLimitResponse;
import com.ebanking.transactionService.entity.TransactionLimit;
import com.ebanking.transactionService.exception.TransactionException;
import com.ebanking.transactionService.repository.TransactionLimitRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@Slf4j
public class TransactionLimitService {

    @Autowired
    private TransactionLimitRepository limitRepository;

    // System maximum limits
    private static final BigDecimal SYSTEM_MAX_SINGLE = new BigDecimal("10000000");
    private static final BigDecimal SYSTEM_MAX_DAILY = new BigDecimal("50000000");
    private static final BigDecimal MIN_LIMIT = new BigDecimal("100000");

    /**
     * Get user's current transaction limits for today
     */
    public TransactionLimitResponse getUserLimits(Long userId) {
        LocalDate today = LocalDate.now();
        
        TransactionLimit limit = limitRepository.findByUserIdAndLimitDate(userId, today)
                .orElseGet(() -> createDefaultLimit(userId, today));

        return TransactionLimitResponse.builder()
                .userId(userId)
                .dailyLimit(limit.getDailyLimit())
                .singleTransactionLimit(limit.getSingleTransactionLimit())
                .usedAmount(limit.getUsedAmount())
                .remainingAmount(limit.getDailyLimit().subtract(limit.getUsedAmount()))
                .limitDate(limit.getLimitDate())
                .systemMaxDailyLimit(SYSTEM_MAX_DAILY)
                .systemMaxSingleLimit(SYSTEM_MAX_SINGLE)
                .build();
    }

    /**
     * Update user's transaction limits
     * IMPORTANT: Only updates limit values, preserves used_amount
     */
    @Transactional
    public TransactionLimitResponse updateUserLimits(TransactionLimitRequest request) 
            throws TransactionException {
        
        // Validation
        validateLimitRequest(request);

        LocalDate today = LocalDate.now();
        
        // Get or create limit for today
        TransactionLimit limit = getOrCreateLimit(request.getUserId(), today);
        
        // Store for logging
        BigDecimal preservedUsedAmount = limit.getUsedAmount();

        // Update ONLY the limit values, preserve used_amount
        limit.setDailyLimit(request.getDailyLimit());
        limit.setSingleTransactionLimit(request.getSingleTransactionLimit());
        limit.setUpdatedAt(LocalDateTime.now());

        TransactionLimit saved = limitRepository.save(limit);
        
        log.info("Updated limits for user {}: daily={}, single={}, used_amount={} (preserved)", 
                request.getUserId(), 
                saved.getDailyLimit(), 
                saved.getSingleTransactionLimit(),
                preservedUsedAmount);

        return TransactionLimitResponse.builder()
                .userId(saved.getUserId())
                .dailyLimit(saved.getDailyLimit())
                .singleTransactionLimit(saved.getSingleTransactionLimit())
                .usedAmount(saved.getUsedAmount())
                .remainingAmount(saved.getDailyLimit().subtract(saved.getUsedAmount()))
                .limitDate(saved.getLimitDate())
                .systemMaxDailyLimit(SYSTEM_MAX_DAILY)
                .systemMaxSingleLimit(SYSTEM_MAX_SINGLE)
                .build();
    }

    /**
     * Get or create limit for user on specific date
     * - If exists: return existing
     * - If new day: inherit settings from most recent, reset used_amount
     * - If first time: use system defaults
     * 
     */
    @Transactional
    public TransactionLimit getOrCreateLimit(Long userId, LocalDate date) {
        // Try to find existing limit for this date
        Optional<TransactionLimit> existing = limitRepository.findByUserIdAndLimitDate(userId, date);
        
        if (existing.isPresent()) {
            log.debug("Found existing limit for user {} on {}", userId, date);
            return existing.get();
        }
        
        // No limit for this date - need to create new one
        log.info("Creating new limit for user {} on {}", userId, date);
        
        // Try to find user's most recent limit settings
        Optional<TransactionLimit> previousLimit = limitRepository.findTopByUserIdOrderByLimitDateDesc(userId);
        
        TransactionLimit newLimit = new TransactionLimit();
        newLimit.setUserId(userId);
        newLimit.setLimitDate(date);
        newLimit.setUsedAmount(BigDecimal.ZERO); // Always reset for new date
        
        if (previousLimit.isPresent()) {
            // User has history - inherit their custom settings
            TransactionLimit prev = previousLimit.get();
            newLimit.setDailyLimit(prev.getDailyLimit());
            newLimit.setSingleTransactionLimit(prev.getSingleTransactionLimit());
            
            log.info("Inherited limits for user {} from {}: daily={}, single={}", 
                    userId, prev.getLimitDate(), 
                    prev.getDailyLimit(), prev.getSingleTransactionLimit());
        } else {
            // First time user - use system defaults
            newLimit.setDailyLimit(SYSTEM_MAX_DAILY);
            newLimit.setSingleTransactionLimit(SYSTEM_MAX_SINGLE);
            
            log.info("First-time limit for user {}: using system defaults (daily={}, single={})", 
                    userId, SYSTEM_MAX_DAILY, SYSTEM_MAX_SINGLE);
        }
        
        newLimit.setCreatedAt(LocalDateTime.now());
        newLimit.setUpdatedAt(LocalDateTime.now());
        
        return limitRepository.save(newLimit);
    }

    /**
     * Update used amount after successful transaction
     * PUBLIC method to be called by TransactionService
     */
    @Transactional
    public void incrementUsedAmount(Long userId, BigDecimal amount) {
        LocalDate today = LocalDate.now();
        
        // Use centralized method to get/create limit
        TransactionLimit limit = getOrCreateLimit(userId, today);
        
        BigDecimal oldUsedAmount = limit.getUsedAmount();
        BigDecimal newUsedAmount = oldUsedAmount.add(amount);
        
        limit.setUsedAmount(newUsedAmount);
        limit.setUpdatedAt(LocalDateTime.now());
        
        limitRepository.save(limit);
        
        log.info("Incremented used_amount for user {}: {} + {} = {}", 
                userId, oldUsedAmount, amount, newUsedAmount);
    }

    /**
     * Validate limit update request
     */
    private void validateLimitRequest(TransactionLimitRequest request) 
            throws TransactionException {
        
        if (request.getDailyLimit() == null || request.getSingleTransactionLimit() == null) {
            throw new TransactionException("Hạn mức không được để trống");
        }

        // Check against system maximum
        if (request.getDailyLimit().compareTo(SYSTEM_MAX_DAILY) > 0) {
            throw new TransactionException(
                "Hạn mức ngày không được vượt quá " + 
                formatMoney(SYSTEM_MAX_DAILY) + " VNĐ"
            );
        }

        if (request.getSingleTransactionLimit().compareTo(SYSTEM_MAX_SINGLE) > 0) {
            throw new TransactionException(
                "Hạn mức giao dịch đơn không được vượt quá " + 
                formatMoney(SYSTEM_MAX_SINGLE) + " VNĐ"
            );
        }

        // Single limit must be <= daily limit
        if (request.getSingleTransactionLimit().compareTo(request.getDailyLimit()) > 0) {
            throw new TransactionException(
                "Hạn mức giao dịch đơn không được lớn hơn hạn mức ngày"
            );
        }

        // Minimum limits
        if (request.getDailyLimit().compareTo(MIN_LIMIT) < 0 || 
            request.getSingleTransactionLimit().compareTo(MIN_LIMIT) < 0) {
            throw new TransactionException(
                "Hạn mức tối thiểu là " + formatMoney(MIN_LIMIT) + " VNĐ"
            );
        }
    }

    private String formatMoney(BigDecimal amount) {
        return String.format("%,.0f", amount);
    }
}
