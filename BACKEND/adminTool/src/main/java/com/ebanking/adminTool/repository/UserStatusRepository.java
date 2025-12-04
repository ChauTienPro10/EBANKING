package com.ebanking.admintool.repository;

import com.ebanking.admintool.entity.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for User Status
 * Manages user status records (ACTIVE, LOCKED, BANNED, SUSPENDED)
 */
@Repository
public interface UserStatusRepository extends JpaRepository<UserStatus, Long> {

    /**
     * Find user status by user ID
     */
    Optional<UserStatus> findByUserId(Long userId);

    /**
     * Find user status by username
     */
    Optional<UserStatus> findByUsername(String username);

    /**
     * Check if user is locked
     */
    @Query("SELECT CASE WHEN us.status = 'LOCKED' THEN true ELSE false END FROM UserStatus us WHERE us.userId = :userId")
    boolean isUserLocked(@Param("userId") Long userId);

    /**
     * Check if user is banned
     */
    @Query("SELECT CASE WHEN us.status = 'BANNED' THEN true ELSE false END FROM UserStatus us WHERE us.userId = :userId")
    boolean isUserBanned(@Param("userId") Long userId);

    /**
     * Check if user exists
     */
    boolean existsByUserId(Long userId);
}

