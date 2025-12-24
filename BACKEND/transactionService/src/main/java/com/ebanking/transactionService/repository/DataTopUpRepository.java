package com.ebanking.transactionService.repository;

import com.ebanking.transactionService.entity.DataTopUp;
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
public interface DataTopUpRepository extends JpaRepository<DataTopUp, Long> {
    
    Optional<DataTopUp> findByTransactionId(String transactionId);
    
    List<DataTopUp> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    Page<DataTopUp> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    List<DataTopUp> findByPhoneNumberOrderByCreatedAtDesc(String phoneNumber);
    
    List<DataTopUp> findByStatusOrderByCreatedAtDesc(String status);
    
    @Query("SELECT dt FROM DataTopUp dt WHERE dt.userId = :userId AND dt.createdAt BETWEEN :startDate AND :endDate ORDER BY dt.createdAt DESC")
    List<DataTopUp> findByUserIdAndDateRange(@Param("userId") Long userId, 
                                           @Param("startDate") LocalDateTime startDate, 
                                           @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT dt FROM DataTopUp dt WHERE dt.phoneNumber = :phoneNumber AND dt.status = :status ORDER BY dt.createdAt DESC")
    List<DataTopUp> findByPhoneNumberAndStatus(@Param("phoneNumber") String phoneNumber, 
                                             @Param("status") String status);
    
    @Query("SELECT COUNT(dt) FROM DataTopUp dt WHERE dt.userId = :userId AND dt.status = 'COMPLETED' AND dt.createdAt >= :startDate")
    Long countSuccessfulTopUpsByUserSince(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT SUM(dt.amount) FROM DataTopUp dt WHERE dt.userId = :userId AND dt.status = 'COMPLETED' AND dt.createdAt BETWEEN :startDate AND :endDate")
    java.math.BigDecimal getTotalAmountByUserAndDateRange(@Param("userId") Long userId, 
                                                         @Param("startDate") LocalDateTime startDate, 
                                                         @Param("endDate") LocalDateTime endDate);
}