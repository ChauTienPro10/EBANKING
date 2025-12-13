package com.ebanking.admintool.controller;

import com.ebanking.admintool.entity.AuditLog;
import com.ebanking.admintool.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Admin Audit Log Controller
 */
@RestController
@RequestMapping("/api/admin/audit-logs")
@RequiredArgsConstructor
@Slf4j
public class AdminAuditController {

    private final AuditLogRepository auditLogRepository;

    /**
     * Get recent audit logs
     * GET /api/admin/audit-logs
     */
    @GetMapping
    public ResponseEntity<Page<AuditLog>> getRecentLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        String adminUsername = authentication.getName();
        log.info("Admin {} fetching audit logs - page: {}, size: {}",
                adminUsername, page, size);

        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<AuditLog> logs = auditLogRepository.findRecentLogs(pageable);

        return ResponseEntity.ok(logs);
    }

    /**
     * Get audit logs by staff username
     * GET /api/admin/audit-logs/staff/{username}
     */
    @GetMapping("/staff/{username}")
    public ResponseEntity<Page<AuditLog>> getLogsByStaff(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        String adminUsername = authentication.getName();
        log.info("Admin {} fetching audit logs for staff: {}", adminUsername, username);

        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<AuditLog> logs = auditLogRepository.findByStaffUsername(username, pageable);

        return ResponseEntity.ok(logs);
    }

    /**
     * Get audit logs by date range
     * GET /api/admin/audit-logs/date-range
     */
    @GetMapping("/date-range")
    public ResponseEntity<Page<AuditLog>> getLogsByDateRange(
            @RequestParam String startDate,
            @RequestParam String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            Authentication authentication) {
        String adminUsername = authentication.getName();
        log.info("Admin {} fetching audit logs from {} to {}",
                adminUsername, startDate, endDate);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        LocalDateTime start = LocalDateTime.parse(startDate + " 00:00:00", formatter);
        LocalDateTime end = LocalDateTime.parse(endDate + " 23:59:59", formatter);

        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<AuditLog> logs = auditLogRepository.findByTimestampBetween(start, end, pageable);

        return ResponseEntity.ok(logs);
    }
}
