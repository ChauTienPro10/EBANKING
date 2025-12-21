package com.ebanking.transactionService.repository;

import com.ebanking.transactionService.entity.InterestRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterestRateRepository extends JpaRepository<InterestRate, Long> {
    
    List<InterestRate> findByStatus(String status);
    
    @Query("SELECT ir FROM InterestRate ir WHERE ir.status = 'ACTIVE' " +
           "AND ir.effectiveFrom <= CURRENT_TIMESTAMP " +
           "AND (ir.effectiveTo IS NULL OR ir.effectiveTo >= CURRENT_TIMESTAMP)")
    List<InterestRate> findActiveRates();
    
    @Query("SELECT ir FROM InterestRate ir WHERE ir.status = 'ACTIVE' " +
           "AND ir.termMonths = :termMonths " +
           "AND ir.minAmount <= :amount " +
           "AND (ir.maxAmount IS NULL OR ir.maxAmount >= :amount) " +
           "AND ir.effectiveFrom <= CURRENT_TIMESTAMP " +
           "AND (ir.effectiveTo IS NULL OR ir.effectiveTo >= CURRENT_TIMESTAMP)")
    Optional<InterestRate> findApplicableRate(@Param("termMonths") Integer termMonths, 
                                            @Param("amount") BigDecimal amount);
    
    List<InterestRate> findByTermMonthsAndStatus(Integer termMonths, String status);
}