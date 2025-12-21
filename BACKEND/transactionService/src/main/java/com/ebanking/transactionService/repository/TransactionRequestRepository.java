package com.ebanking.transactionService.repository;

import com.ebanking.transactionService.entity.TransactionRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransactionRequestRepository extends JpaRepository<TransactionRequest, Long> {
    
    Optional<TransactionRequest> findByRequestNumber(String requestNumber);
    
    List<TransactionRequest> findByUserId(Long userId);
    
    List<TransactionRequest> findByUserIdAndStatus(Long userId, String status);
    
    List<TransactionRequest> findBySavingsAccountId(Long savingsAccountId);
    
    List<TransactionRequest> findByStatus(String status);
    
    @Query("SELECT tr FROM TransactionRequest tr WHERE tr.status = 'PENDING' ORDER BY tr.requestedAt ASC")
    List<TransactionRequest> findPendingRequests();
    
    @Query("SELECT tr FROM TransactionRequest tr WHERE tr.userId = :userId " +
           "AND tr.requestType = :requestType ORDER BY tr.requestedAt DESC")
    List<TransactionRequest> findByUserIdAndRequestType(@Param("userId") Long userId, 
                                                       @Param("requestType") String requestType);
    
    boolean existsByRequestNumber(String requestNumber);
}