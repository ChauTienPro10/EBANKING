package com.ebanking.adminTool.controller;

import com.ebanking.adminTool.dto.ApiResponse;
import com.ebanking.adminTool.dto.UserInfoDto;
import com.ebanking.adminTool.service.UserManagementService;
import com.ebanking.adminTool.utils.AuditAction;
import com.ebanking.adminTool.utils.AuditLogger;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = "*")
public class UserMangementController {

    private static final Logger logger = LoggerFactory.getLogger(UserMangementController.class);
    private final UserManagementService userManagementService;
    private final AuditLogger auditLogger;

    @Autowired
    public UserMangementController(UserManagementService userManagementService, AuditLogger auditLogger) {
        this.userManagementService = userManagementService;
        this.auditLogger = auditLogger;
    }

    /**
     * Get all users from DB_USER_SERVICE
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserInfoDto>>> getAllUsers(Authentication authentication) {
        try {
            logger.info("Fetching all users from DB_USER_SERVICE");
            List<UserInfoDto> users = userManagementService.getAllUsers();
            logger.info("Successfully fetched {} users", users.size());
            String admin = authentication != null ? authentication.getName() : "SYSTEM";
            auditLogger.logSuccess(
                    admin,
                    AuditAction.VIEW_USERS,
                    "USER",
                    null,
                    "GET_ALL_USERS count=" + users.size(),
                    null);
            return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
        } catch (Exception e) {
            logger.error("Error fetching all users: {}", e.getMessage(), e);
            String admin = authentication != null ? authentication.getName() : "SYSTEM";
            auditLogger.logFailure(
                    admin,
                    AuditAction.VIEW_USERS,
                    "USER",
                    null,
                    "GET_ALL_USERS failed: " + e.getMessage(),
                    null);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch users: " + e.getMessage()));
        }
    }

    /**
     * Get user by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserInfoDto>> getUserById(@PathVariable Long id, Authentication authentication) {
        try {
            logger.info("Fetching user with ID: {}", id);
            UserInfoDto user = userManagementService.getUserById(id);
            if (user != null) {
                logger.info("Successfully found user with ID: {}", id);
                String admin = authentication != null ? authentication.getName() : "SYSTEM";
                auditLogger.logSuccess(
                        admin,
                        AuditAction.VIEW_USERS,
                        "USER",
                        String.valueOf(id),
                        "GET_USER_BY_ID",
                        null);
                return ResponseEntity.ok(ApiResponse.success("User found", user));
            } else {
                logger.warn("User not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            logger.error("Error fetching user with ID {}: {}", id, e.getMessage(), e);
            String admin = authentication != null ? authentication.getName() : "SYSTEM";
            auditLogger.logFailure(
                    admin,
                    AuditAction.VIEW_USERS,
                    "USER",
                    String.valueOf(id),
                    "GET_USER_BY_ID failed: " + e.getMessage(),
                    null);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch user: " + e.getMessage()));
        }
    }

    /**
     * Search users by name (full name or username)
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserInfoDto>>> searchUsers(@RequestParam String name, Authentication authentication) {
        try {
            logger.info("Searching users with name: {}", name);
            List<UserInfoDto> users = userManagementService.searchUsersByName(name);
            logger.info("Found {} users matching search term: {}", users.size(), name);
            String admin = authentication != null ? authentication.getName() : "SYSTEM";
            auditLogger.logSuccess(
                    admin,
                    AuditAction.VIEW_USERS,
                    "USER",
                    null,
                    "SEARCH_USERS name=" + name + ", count=" + users.size(),
                    null);
            return ResponseEntity.ok(ApiResponse.success("Search completed", users));
        } catch (Exception e) {
            logger.error("Error searching users with name {}: {}", name, e.getMessage(), e);
            String admin = authentication != null ? authentication.getName() : "SYSTEM";
            auditLogger.logFailure(
                    admin,
                    AuditAction.VIEW_USERS,
                    "USER",
                    null,
                    "SEARCH_USERS failed: " + e.getMessage(),
                    null);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to search users: " + e.getMessage()));
        }
    }

    /**
     * Get users with pagination
     */
    @GetMapping("/paginated")
    public ResponseEntity<ApiResponse<List<UserInfoDto>>> getUsersPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        try {
            logger.info("Fetching users with pagination - page: {}, size: {}", page, size);
            List<UserInfoDto> users = userManagementService.getUsersPaginated(page, size);
            logger.info("Successfully fetched {} users for page {}", users.size(), page);
            String admin = authentication != null ? authentication.getName() : "SYSTEM";
            auditLogger.logSuccess(
                    admin,
                    AuditAction.VIEW_USERS,
                    "USER",
                    null,
                    "GET_USERS_PAGINATED page=" + page + ", size=" + size,
                    null);
            return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", users));
        } catch (Exception e) {
            logger.error("Error fetching paginated users: {}", e.getMessage(), e);
            String admin = authentication != null ? authentication.getName() : "SYSTEM";
            auditLogger.logFailure(
                    admin,
                    AuditAction.VIEW_USERS,
                    "USER",
                    null,
                    "GET_USERS_PAGINATED failed: " + e.getMessage(),
                    null);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch users: " + e.getMessage()));
        }
    }

    /**
     * Get total user count
     */
    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getTotalUserCount(Authentication authentication) {
        try {
            logger.info("Fetching total user count");
            long count = userManagementService.getTotalUserCount();
            logger.info("Total user count: {}", count);
            String admin = authentication != null ? authentication.getName() : "SYSTEM";
            auditLogger.logSuccess(
                    admin,
                    AuditAction.VIEW_USERS,
                    "USER",
                    null,
                    "GET_USER_COUNT count=" + count,
                    null);
            return ResponseEntity.ok(ApiResponse.success("User count retrieved", count));
        } catch (Exception e) {
            logger.error("Error fetching user count: {}", e.getMessage(), e);
            String admin = authentication != null ? authentication.getName() : "SYSTEM";
            auditLogger.logFailure(
                    admin,
                    AuditAction.VIEW_USERS,
                    "USER",
                    null,
                    "GET_USER_COUNT failed: " + e.getMessage(),
                    null);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch user count: " + e.getMessage()));
        }
    }
}
