package com.ebanking.transactionService.repository;

import com.ebanking.transactionService.entity.TransactionLimit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface TransactionLimitRepository extends JpaRepository<TransactionLimit, Long> {

    Optional<TransactionLimit> findByUserIdAndLimitDate(Long userId, LocalDate limitDate);

    /**
     * Find user's most recent limit record (for inheriting settings to new day)
     * Returns the limit with the latest limit_date for the given user
     */
    Optional<TransactionLimit> findTopByUserIdOrderByLimitDateDesc(Long userId);

    /**
     * Calculate total successful transactions for user today
     */
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t " +
            "WHERE t.username = :username " +
            "AND DATE(t.transactionAt) = :date " +
            "AND t.status = 'SUCCESS'")
    BigDecimal getTodayTotalAmount(@Param("username") String username,
                                   @Param("date") LocalDate date);
}
