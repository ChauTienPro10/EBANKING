package com.ebanking.transactionService.repository;

import com.ebanking.transactionService.entity.SavingsAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SavingsAccountRepository extends JpaRepository<SavingsAccount, Long> {
    
    Optional<SavingsAccount> findByAccountNumber(String accountNumber);
    
    List<SavingsAccount> findByUserId(Long userId);
    
    List<SavingsAccount> findByUserIdAndStatus(Long userId, String status);
    
    @Query("SELECT sa FROM SavingsAccount sa WHERE sa.status = 'ACTIVE' AND sa.maturityDate <= CURRENT_TIMESTAMP")
    List<SavingsAccount> findMaturedAccounts();
    
    @Query("SELECT sa FROM SavingsAccount sa WHERE sa.paymentAccountId = :paymentAccountId")
    List<SavingsAccount> findByPaymentAccountId(@Param("paymentAccountId") Long paymentAccountId);
    
    boolean existsByAccountNumber(String accountNumber);
}