package com.ebanking.adminTool.controller;

import com.ebanking.adminTool.dto.request.ChangePasswordRequest;
import com.ebanking.adminTool.dto.request.CreateAdminRequest;
import com.ebanking.adminTool.dto.request.ResetPasswordRequest;
import com.ebanking.adminTool.dto.request.UpdateAdminRequest;
import com.ebanking.adminTool.dto.response.AdminDto;
import com.ebanking.adminTool.service.AdminStaffService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/admins")
@RequiredArgsConstructor
@Slf4j
public class AdminStaffController {

    private final AdminStaffService adminStaffService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AdminDto>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean active,
            Authentication authentication) {
        String requester = authentication.getName();
        Page<AdminDto> result = adminStaffService.list(requester, page, size, search, role, active);
        return ResponseEntity.ok(result);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDto> create(
            @Valid @RequestBody CreateAdminRequest request,
            Authentication authentication) {
        String requester = authentication.getName();
        AdminDto created = adminStaffService.create(requester, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminDto> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAdminRequest request,
            Authentication authentication) {
        String requester = authentication.getName();
        AdminDto updated = adminStaffService.update(requester, id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deactivate(
            @PathVariable Long id,
            Authentication authentication) {
        String requester = authentication.getName();
        adminStaffService.deactivate(requester, id, requester);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody ResetPasswordRequest request,
            Authentication authentication) {
        String requester = authentication.getName();
        adminStaffService.resetPassword(requester, id, request.getNewPassword());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> changeOwnPassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication) {
        String requester = authentication.getName();
        adminStaffService.changeOwnPassword(requester, request.getOldPassword(), request.getNewPassword());
        return ResponseEntity.noContent().build();
    }
}
