package com.ebanking.admintool.repository;

import com.ebanking.admintool.entity.TransactionFlag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionFlagRepository extends JpaRepository<TransactionFlag, Long> {
    List<TransactionFlag> findByTransactionIdOrderByFlaggedAtDesc(Long transactionId);
}

