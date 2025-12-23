package com.ebanking.adminTool.repository;

import com.ebanking.adminTool.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE LOWER(a.staffUsername) LIKE LOWER(CONCAT('%', :staffUsername, '%')) ORDER BY a.timestamp DESC")
    Page<AuditLog> findByStaffUsername(@Param("staffUsername") String staffUsername, Pageable pageable);

    Page<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);

    @Query("SELECT a FROM AuditLog a ORDER BY a.timestamp DESC")
    Page<AuditLog> findRecentLogs(Pageable pageable);

    @Query("""
            SELECT a FROM AuditLog a
            LEFT JOIN com.ebanking.adminTool.entity.Admin ad ON a.staffUsername = ad.username
            WHERE (:success IS NULL OR a.success = :success)
              AND (:action IS NULL OR a.action = :action)
              AND (:ip IS NULL OR a.ipAddress LIKE CONCAT('%', :ip, '%'))
              AND (:role IS NULL OR ad.role = :role OR :role IS NULL)
            ORDER BY a.timestamp DESC
            """)
    Page<AuditLog> searchWithFilters(@Param("success") Boolean success,
                                     @Param("action") String action,
                                     @Param("ip") String ip,
                                     @Param("role") String role,
                                     Pageable pageable);

    /**
     * Count login attempts by action, success status and timestamp range
     */
    long countByActionAndSuccessAndTimestampBetween(String action, boolean success, LocalDateTime start,
            LocalDateTime end);
}
