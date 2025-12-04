package com.ebanking.admintool.repository;

import com.ebanking.admintool.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for Audit Log
 */
@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    /**
     * Find audit logs by staff username
     */
    Page<AuditLog> findByStaffUsername(String staffUsername, Pageable pageable);

    /**
     * Find audit logs by action
     */
    Page<AuditLog> findByAction(String action, Pageable pageable);

    /**
     * Find audit logs by target type
     */
    Page<AuditLog> findByTargetType(String targetType, Pageable pageable);

    /**
     * Find audit logs by timestamp range
     */
    Page<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    /**
     * Find audit logs by staff and timestamp range
     */
    Page<AuditLog> findByStaffUsernameAndTimestampBetween(
            String staffUsername, 
            LocalDateTime start, 
            LocalDateTime end, 
            Pageable pageable
    );

    /**
     * Find recent audit logs
     */
    @Query("SELECT a FROM AuditLog a ORDER BY a.timestamp DESC")
    Page<AuditLog> findRecentLogs(Pageable pageable);

    /**
     * Count failed actions by staff
     */
    @Query("SELECT COUNT(a) FROM AuditLog a WHERE a.staffUsername = :username AND a.success = false")
    long countFailedActionsByStaff(@Param("username") String username);
}

