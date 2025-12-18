package com.ebanking.adminTool.service;

import com.ebanking.adminTool.dto.request.CreateAdminRequest;
import com.ebanking.adminTool.dto.request.UpdateAdminRequest;
import com.ebanking.adminTool.dto.response.AdminDto;
import com.ebanking.adminTool.entity.Admin;
import com.ebanking.adminTool.exception.BusinessException;
import com.ebanking.adminTool.exception.ResourceNotFoundException;
import com.ebanking.adminTool.repository.AdminRepository;
import com.ebanking.adminTool.utils.AuditLogger;
import com.ebanking.adminTool.validator.PasswordValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminStaffService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogger auditLogger;
    private final PasswordValidator passwordValidator;

    public Page<AdminDto> list(String requester, int page, int size, String search, String role, Boolean active) {
        int maxSize = Math.min(Math.max(size, 1), 100);
        Pageable pageable = PageRequest.of(Math.max(page, 0), maxSize);
        Page<Admin> result = adminRepository.searchAdmins(
                (search == null || search.isBlank()) ? null : search.trim(),
                (role == null || role.isBlank()) ? null : role.trim(),
                active,
                pageable);
        auditLogger.logSuccess(requester, "LIST_ADMINS", "ADMIN", null,
                "page=" + page + ", size=" + maxSize + ", q=" + search + ",  role=" + role + ", active=" + active, null);
        return result.map(AdminDto::fromEntity);
    }

    @Transactional
    public AdminDto create(String requester, CreateAdminRequest req) {
        if (adminRepository.existsByUsername(req.getUsername())) {
            auditLogger.logFailure(requester, "CREATE_ADMIN", "ADMIN", null, "username conflicts", null);
            throw new BusinessException("ADMIN_ERROR", "Unable to create admin account", HttpStatus.BAD_REQUEST);
        }
        
        passwordValidator.validate(req.getPassword());
        
        String sanitizedFullName = req.getFullName().replaceAll("[<>\"'&]", "");
        
        Admin admin = Admin.builder()
                .username(req.getUsername().trim().toLowerCase())
                .password(passwordEncoder.encode(req.getPassword()))
                .fullName(sanitizedFullName.trim())
                .role(req.getRole())
                .build();
        Admin saved = adminRepository.save(admin);
        auditLogger.logSuccess(requester, "CREATE_ADMIN", "ADMIN", String.valueOf(saved.getId()),
                "Created admin " + req.getUsername(), null);
        return AdminDto.fromEntity(saved);
    }

    @Transactional
    public AdminDto update(String requester, Long id, UpdateAdminRequest req) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", id));
        admin.setFullName(req.getFullName());
        admin.setRole(req.getRole());
        admin.setActive(Boolean.TRUE.equals(req.getActive()));
        Admin saved = adminRepository.save(admin);
        auditLogger.logSuccess(requester, "UPDATE_ADMIN", "ADMIN", String.valueOf(id), "Updated admin", null);
        return AdminDto.fromEntity(saved);
    }

    @Transactional
    public void deactivate(String requester, Long id, String requesterUsername) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", id));
        if (admin.getUsername().equalsIgnoreCase(requesterUsername)) {
            auditLogger.logFailure(requester, "DEACTIVATE_ADMIN", "ADMIN", String.valueOf(id),
                    "Cannot deactivate self", null);
            throw new BusinessException("CANNOT_DEACTIVATE_SELF", "You cannot deactivate your own account", HttpStatus.BAD_REQUEST);
        }
        admin.setActive(false);
        adminRepository.save(admin);
        auditLogger.logSuccess(requester, "DEACTIVATE_ADMIN", "ADMIN", String.valueOf(id), "Deactivated admin", null);
    }

    @Transactional
    public void resetPassword(String requester, Long id, String newPassword) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", id));
        
        // Validate password strength
        passwordValidator.validate(newPassword);
        
        admin.setPassword(passwordEncoder.encode(newPassword));
        adminRepository.save(admin);
        auditLogger.logSuccess(requester, "RESET_PASSWORD", "ADMIN", String.valueOf(id), "Password reset", null);
    }

    @Transactional
    public void changeOwnPassword(String requester, String oldPassword, String newPassword) {
        Admin admin = adminRepository.findByUsername(requester)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", requester));
        if (!passwordEncoder.matches(oldPassword, admin.getPassword())) {
            auditLogger.logFailure(requester, "CHANGE_PASSWORD", "ADMIN", String.valueOf(admin.getId()),
                    "Password mismatch", null);
            throw new BusinessException("INVALID_CREDENTIALS", "Unable to change password", HttpStatus.BAD_REQUEST);
        }
        
        passwordValidator.validate(newPassword);
        
        admin.setPassword(passwordEncoder.encode(newPassword));
        adminRepository.save(admin);
        auditLogger.logSuccess(requester, "CHANGE_PASSWORD", "ADMIN", String.valueOf(admin.getId()),
                "Password changed", null);
    }
}
