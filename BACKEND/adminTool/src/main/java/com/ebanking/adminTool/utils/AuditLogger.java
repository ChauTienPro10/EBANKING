package com.ebanking.adminTool.utils;

import com.ebanking.adminTool.entity.AuditLog;
import com.ebanking.adminTool.repository.AuditLogRepository;
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
     * FIXED: Now includes IP address for security tracking
     *
     * @param staffUsername Username of the staff performing the action
     * @param action        Action performed (e.g., "VIEW_USER", "LOCK_ACCOUNT")
     * @param targetType    Type of target (e.g., "USER", "ACCOUNT", "TRANSACTION")
     * @param targetId      ID of the target
     * @param details       Additional details about the action
     * @param success       Whether the action was successful
     * @param ipAddress     IP address of the requester (optional)
     */
    public void logAction(String staffUsername, String action, String targetType,
            String targetId, String details, boolean success, String ipAddress) {
        try {
            AuditLog auditLog = AuditLog.builder()
                    .staffUsername(staffUsername)
                    .action(action)
                    .targetType(targetType)
                    .targetId(targetId)
                    .details(details)
                    .success(success)
                    .ipAddress(ipAddress) // FIXED: Now includes IP address
                    .timestamp(LocalDateTime.now())
                    .build();

            auditLogRepository.save(auditLog);

            log.info("AUDIT: {} | {} | {} | {} | {} | IP: {} | Success: {}",
                    staffUsername, action, targetType, targetId, details, ipAddress, success);
        } catch (Exception e) {
            log.error("Failed to save audit log", e);
        }
    }

    /**
     * Log successful action
     * FIXED: Now accepts IP address parameter
     */
    public void logSuccess(String staffUsername, String action, String targetType,
            String targetId, String details, String ipAddress) {
        logAction(staffUsername, action, targetType, targetId, details, true, ipAddress);
    }

    /**
     * Log failed action
     * FIXED: Now accepts IP address parameter
     */
    public void logFailure(String staffUsername, String action, String targetType,
            String targetId, String details, String ipAddress) {
        logAction(staffUsername, action, targetType, targetId, details, false, ipAddress);
    }

    public void logSuccess(String staffUsername, AuditAction action, String targetType,
            String targetId, String details, String ipAddress) {
        logSuccess(staffUsername, action.code(), targetType, targetId, details, ipAddress);
    }

    public void logFailure(String staffUsername, AuditAction action, String targetType,
            String targetId, String details, String ipAddress) {
        logFailure(staffUsername, action.code(), targetType, targetId, details, ipAddress);
    }

}
