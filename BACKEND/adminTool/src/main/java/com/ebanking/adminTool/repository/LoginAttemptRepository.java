package com.ebanking.admintool.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * Repository for Login Attempt tracking
 */
@Repository
public interface LoginAttemptRepository extends JpaRepository<com.ebanking.admintool.entity.LoginAttempt, Long> {
    
    @Modifying
    @Query("DELETE FROM LoginAttempt l WHERE l.lastAttempt < :threshold")
    int deleteByLastAttemptBefore(@Param("threshold") LocalDateTime threshold);
    
    @Modifying
    @Query("UPDATE LoginAttempt l SET l.attemptCount = 0, l.lockedUntil = null WHERE l.lockedUntil IS NOT NULL AND l.lockedUntil < :now")
    int resetExpiredLocks(@Param("now") LocalDateTime now);
}
