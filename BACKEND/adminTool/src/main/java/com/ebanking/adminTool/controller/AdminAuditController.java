package com.ebanking.adminTool.controller;

import com.ebanking.adminTool.entity.AuditLog;
import com.ebanking.adminTool.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/audit-logs")
@RequiredArgsConstructor
@Slf4j
public class AdminAuditController {

    private final AuditLogRepository auditLogRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Page<AuditLog>> getRecentLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String ip,
            @RequestParam(required = false) String role,
            Authentication authentication) {
        String adminUsername = authentication.getName();
        log.info("Admin {} fetching audit logs - page: {}, size: {}, status: {}, action: {}, ip: {}, role: {}",
                adminUsername, page, size, status, action, ip, role);

        Boolean successFilter = null;
        if (status != null && !status.isBlank()) {
            if ("SUCCESS".equalsIgnoreCase(status)) {
                successFilter = Boolean.TRUE;
            } else if ("FAILURE".equalsIgnoreCase(status) || "FAILED".equalsIgnoreCase(status)) {
                successFilter = Boolean.FALSE;
            }
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("timestamp").descending());
        Page<AuditLog> logs = auditLogRepository.searchWithFilters(
                successFilter,
                (action == null || action.isBlank()) ? null : action,
                (ip == null || ip.isBlank()) ? null : ip,
                (role == null || role.isBlank()) ? null : role,
                pageable);

        return ResponseEntity.ok(logs);
    }

    @GetMapping("/staff/{username}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
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

    @GetMapping("/date-range")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
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
