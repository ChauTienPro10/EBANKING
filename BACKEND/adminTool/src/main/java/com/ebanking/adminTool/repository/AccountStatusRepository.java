package com.ebanking.admintool.repository;

import com.ebanking.admintool.entity.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AccountStatusRepository extends JpaRepository<AccountStatus, Long> {

    Optional<AccountStatus> findByAccountId(Long accountId);

    Optional<AccountStatus> findByAccountNumber(String accountNumber);

    boolean existsByAccountId(Long accountId);

    boolean existsByAccountNumber(String accountNumber);

    @Query("SELECT CASE WHEN a.status = 'LOCKED' THEN true ELSE false END FROM AccountStatus a WHERE a.accountId = :accountId")
    boolean isLocked(@Param("accountId") Long accountId);

    @Query("SELECT CASE WHEN a.status = 'FROZEN' THEN true ELSE false END FROM AccountStatus a WHERE a.accountId = :accountId")
    boolean isFrozen(@Param("accountId") Long accountId);
}

