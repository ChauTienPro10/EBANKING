package com.ebanking.transactionService.repository;

import com.ebanking.transactionService.entity.TelecomProvider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TelecomProviderRepository extends JpaRepository<TelecomProvider, Long> {

    /**
     * Find by provider code
     */
    Optional<TelecomProvider> findByProviderCode(String providerCode);

    /**
     * Find active providers
     */
    List<TelecomProvider> findByIsActiveTrueOrderByProviderName();

    /**
     * Find by provider name
     */
    Optional<TelecomProvider> findByProviderName(String providerName);

    /**
     * Check if provider code exists
     */
    boolean existsByProviderCode(String providerCode);
}