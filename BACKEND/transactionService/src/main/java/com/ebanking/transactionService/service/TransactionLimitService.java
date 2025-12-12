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
     */
    @Transactional
    public TransactionLimitResponse updateUserLimits(TransactionLimitRequest request) 
            throws TransactionException {
        
        // Validation
        validateLimitRequest(request);

        LocalDate today = LocalDate.now();
        
        TransactionLimit limit = limitRepository.findByUserIdAndLimitDate(
                request.getUserId(), today)
                .orElseGet(() -> createDefaultLimit(request.getUserId(), today));

        // Update limits
        limit.setDailyLimit(request.getDailyLimit());
        limit.setSingleTransactionLimit(request.getSingleTransactionLimit());
        limit.setUpdatedAt(LocalDateTime.now());

        TransactionLimit saved = limitRepository.save(limit);
        
        log.info("Updated limits for user {}: daily={}, single={}", 
                request.getUserId(), 
                request.getDailyLimit(), 
                request.getSingleTransactionLimit());

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
     * Create default limit for user (fallback if not exists)
     */
    private TransactionLimit createDefaultLimit(Long userId, LocalDate date) {
        TransactionLimit limit = new TransactionLimit();
        limit.setUserId(userId);
        limit.setLimitDate(date);
        limit.setDailyLimit(SYSTEM_MAX_DAILY);
        limit.setSingleTransactionLimit(SYSTEM_MAX_SINGLE);
        limit.setUsedAmount(BigDecimal.ZERO);
        limit.setCreatedAt(LocalDateTime.now());
        limit.setUpdatedAt(LocalDateTime.now());
        
        TransactionLimit saved = limitRepository.save(limit);
        log.info("Created default limits for user {}: daily={}, single={}", 
                userId, SYSTEM_MAX_DAILY, SYSTEM_MAX_SINGLE);
        
        return saved;
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
