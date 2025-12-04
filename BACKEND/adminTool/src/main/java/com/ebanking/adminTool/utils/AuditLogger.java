package com.ebanking.admintool.utils;

import com.ebanking.admintool.entity.AuditLog;
import com.ebanking.admintool.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

/**
 * Admin Audit Logger
 * Logs all admin actions for security and compliance
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class AuditLogger {

    private final AuditLogRepository auditLogRepository;

    /**
     * Log an admin action
     * 
     * @param staffUsername Username of the staff performing the action
     * @param action Action performed (e.g., "VIEW_USER", "LOCK_ACCOUNT")
     * @param targetType Type of target (e.g., "USER", "ACCOUNT", "TRANSACTION")
     * @param targetId ID of the target
     * @param details Additional details about the action
     * @param success Whether the action was successful
     */
    public void logAction(String staffUsername, String action, String targetType, 
                         String targetId, String details, boolean success) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .staffUsername(staffUsername)
                    .action(action)
                    .targetType(targetType)
                    .targetId(targetId)
                    .details(details)
                    .success(success)
                    .timestamp(LocalDateTime.now())
                    .build();

            auditLogRepository.save(auditLog);
            
            log.info("AUDIT: {} | {} | {} | {} | {} | Success: {}", 
                    staffUsername, action, targetType, targetId, details, success);
        } catch (Exception e) {
            log.error("Failed to save audit log", e);
        }
    }

    /**
     * Log successful action
     */
    public void logSuccess(String staffUsername, String action, String targetType, 
                          String targetId, String details) {
        logAction(staffUsername, action, targetType, targetId, details, true);
    }

    /**
     * Log failed action
     */
    public void logFailure(String staffUsername, String action, String targetType, 
                          String targetId, String details) {
        logAction(staffUsername, action, targetType, targetId, details, false);
    }
}

