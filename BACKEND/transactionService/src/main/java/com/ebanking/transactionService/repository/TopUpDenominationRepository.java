package com.ebanking.transactionService.repository;

import com.ebanking.transactionService.entity.TopUpDenomination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TopUpDenominationRepository extends JpaRepository<TopUpDenomination, Long> {

    /**
     * Find denominations by provider ID
     */
    List<TopUpDenomination> findByProviderIdAndIsActiveTrueOrderBySortOrderAscAmountAsc(Long providerId);

    /**
     * Find all active denominations
     */
    List<TopUpDenomination> findByIsActiveTrueOrderByProviderIdAscSortOrderAscAmountAsc();

    /**
     * Find denomination by provider and amount
     */
    Optional<TopUpDenomination> findByProviderIdAndAmountAndIsActiveTrue(Long providerId, BigDecimal amount);

    /**
     * Find denominations by amount range
     */
    List<TopUpDenomination> findByProviderIdAndAmountBetweenAndIsActiveTrueOrderByAmountAsc(
            Long providerId, BigDecimal minAmount, BigDecimal maxAmount);
}