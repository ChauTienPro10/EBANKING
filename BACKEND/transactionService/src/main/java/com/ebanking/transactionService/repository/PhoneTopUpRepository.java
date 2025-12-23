package com.ebanking.transactionService.repository;

import com.ebanking.transactionService.entity.PhoneTopUp;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PhoneTopUpRepository extends JpaRepository<PhoneTopUp, Long> {

    /**
     * Find by transaction ID
     */
    Optional<PhoneTopUp> findByTransactionId(String transactionId);

    /**
     * Find by provider transaction ID
     */
    Optional<PhoneTopUp> findByProviderTransactionId(String providerTransactionId);

    /**
     * Find user's top-up history
     */
    List<PhoneTopUp> findByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Find user's top-up history with pagination
     */
    Page<PhoneTopUp> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Find by username
     */
    List<PhoneTopUp> findByUsernameOrderByCreatedAtDesc(String username);

    /**
     * Find by phone number
     */
    List<PhoneTopUp> findByPhoneNumberOrderByCreatedAtDesc(String phoneNumber);

    /**
     * Find by status
     */
    List<PhoneTopUp> findByStatusOrderByCreatedAtDesc(String status);

    /**
     * Find by telecom provider
     */
    List<PhoneTopUp> findByTelecomProviderOrderByCreatedAtDesc(String telecomProvider);

    /**
     * Find pending transactions (for processing)
     */
    List<PhoneTopUp> findByStatusInOrderByCreatedAtAsc(List<String> statuses);

    /**
     * Find user's transactions in date range
     */
    @Query("SELECT p FROM PhoneTopUp p WHERE p.userId = :userId AND p.createdAt BETWEEN :startDate AND :endDate ORDER BY p.createdAt DESC")
    List<PhoneTopUp> findByUserIdAndDateRange(@Param("userId") Long userId, 
                                             @Param("startDate") LocalDateTime startDate, 
                                             @Param("endDate") LocalDateTime endDate);

    /**
     * Count user's transactions today
     */
    @Query("SELECT COUNT(p) FROM PhoneTopUp p WHERE p.userId = :userId AND DATE(p.createdAt) = CURRENT_DATE")
    long countUserTransactionsToday(@Param("userId") Long userId);

    /**
     * Sum user's transaction amount today
     */
    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PhoneTopUp p WHERE p.userId = :userId AND DATE(p.createdAt) = CURRENT_DATE AND p.status = 'COMPLETED'")
    java.math.BigDecimal sumUserTransactionsToday(@Param("userId") Long userId);

    /**
     * Find transactions requiring face auth verification
     */
    List<PhoneTopUp> findByRequiresFaceAuthTrueAndFaceAuthVerifiedFalse();

    /**
     * Find by face auth session ID
     */
    Optional<PhoneTopUp> findByFaceAuthSessionId(String faceAuthSessionId);
}