package com.ebanking.transactionService.repository;

import com.ebanking.transactionService.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    @Query("SELECT t FROM Transaction t WHERE " +
            "(:username IS NULL OR t.username = :username) AND " +
            "(:sender IS NULL OR t.senderAccountNumber = :sender) AND " +
            "t.transactionAt BETWEEN :fromDate AND :toDate")
    Page<Transaction> findByUsernameAndSenderAndDateRange(
            @Param("username") String username,
            @Param("sender") String sender,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            Pageable pageable);

}
