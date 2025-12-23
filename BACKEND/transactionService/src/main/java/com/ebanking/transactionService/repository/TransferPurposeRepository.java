package com.ebanking.transactionService.repository;

import com.ebanking.transactionService.entity.TransferPurpose;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransferPurposeRepository extends JpaRepository<TransferPurpose, String> {
    
    @Query("SELECT tp FROM TransferPurpose tp WHERE tp.isActive = true ORDER BY tp.name")
    List<TransferPurpose> findAllActiveOrderByName();
    
    Optional<TransferPurpose> findByCodeAndIsActive(String code, Boolean isActive);
}