package com.ebanking.adminTool.controller;

import com.ebanking.adminTool.config.ApplicationInfo;
import com.ebanking.adminTool.dto.response.SystemInfoResponse;
import com.ebanking.adminTool.repository.AdminRepository;
import com.ebanking.adminTool.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@RestController
@RequestMapping("/system")
@RequiredArgsConstructor
public class SystemController {

    private final ApplicationInfo appInfo;
    private final AdminRepository adminRepository;
    private final AuditLogRepository auditLogRepository;

    @GetMapping("/info")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SystemInfoResponse> info() {
        long activeStaff = adminRepository.countByActiveTrue();
        LocalDate today = LocalDate.now();
        LocalDateTime start = today.atStartOfDay();
        LocalDateTime end = today.atTime(LocalTime.MAX);
        long loginsToday = auditLogRepository.countByActionAndSuccessAndTimestampBetween("LOGIN", true, start, end);
        SystemInfoResponse resp = SystemInfoResponse.builder()
                .health("UP")
                .version(appInfo.getVersion())
                .uptimeSeconds(appInfo.getUptime().getSeconds())
                .totalActiveStaff(activeStaff)
                .totalLoginsToday(loginsToday)
                .build();
        return ResponseEntity.ok(resp);
    }
}

