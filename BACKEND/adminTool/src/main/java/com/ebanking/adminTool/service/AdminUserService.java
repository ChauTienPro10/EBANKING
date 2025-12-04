package com.ebanking.admintool.service;

import com.banking.userService.grpc.UserProto;
import com.ebanking.admintool.dto.response.UserDetailResponse;
import com.ebanking.admintool.entity.UserStatus;
import com.ebanking.admintool.repository.UserStatusRepository;
import com.ebanking.admintool.service.grpc.TransactionGrpcClient;
import com.ebanking.admintool.service.grpc.UserGrpcClient;
import com.ebanking.admintool.utils.AuditLogger;
import com.ebanking.transactionService.grpc.AccountProto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Admin User Management Service
 * Manages user operations for admin tool
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class AdminUserService {

    private final UserGrpcClient userGrpcClient;
    private final TransactionGrpcClient transactionGrpcClient;
    private final AuditLogger auditLogger;
    private final UserStatusRepository userStatusRepository;

    /**
     * Get user detail by username
     * Includes user info and account info
     */
    public UserDetailResponse getUserDetail(String adminUsername, String targetUsername) {
        try {
            log.info("Admin {} fetching detail for user: {}", adminUsername, targetUsername);

            long userId = userGrpcClient.getUserIdByUsername(targetUsername);

            UserProto.UserResponse userResponse = userGrpcClient.getUserById(userId);
            UserProto.User user = userResponse.getUser();

            List<UserDetailResponse.AccountInfo> accounts = new ArrayList<>();
            try {
                AccountProto.AccountResponse accountResponse = transactionGrpcClient.getAccountInfo(userId);
                if (accountResponse != null) {
                    UserDetailResponse.AccountInfo accountInfo = UserDetailResponse.AccountInfo.builder()
                            .accountId(accountResponse.getAccountId())
                            .accountNumber(accountResponse.getAccountNumber())
                            .accountType(accountResponse.getAccountType())
                            .balance(accountResponse.getBalance())
                            .currency(accountResponse.getCurrency())
                            .status(accountResponse.getStatus())
                            .openedDate(accountResponse.getOpenedDate())
                            .build();
                    accounts.add(accountInfo);
                }
            } catch (Exception e) {
                log.warn("Failed to fetch account info for user {}: {}", userId, e.getMessage());
            }

            auditLogger.logSuccess(
                    adminUsername,
                    "VIEW_USER_DETAIL",
                    "USER",
                    String.valueOf(userId),
                    "Viewed user: " + targetUsername);

            return UserDetailResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .citizenId(user.getCitizenId())
                    .birthday(user.getBirthday())
                    .isMale(user.getIsMale())
                    .address(user.getAddress())
                    .createAt(user.getCreateAt())
                    .roles(user.getRolesList())
                    .status("ACTIVE") // TODO: Add status field to User proto
                    .accounts(accounts)
                    .build();

        } catch (Exception e) {
            log.error("Failed to get user detail", e);
            auditLogger.logFailure(
                    adminUsername,
                    "VIEW_USER_DETAIL",
                    "USER",
                    targetUsername,
                    "Failed: " + e.getMessage());
            throw new RuntimeException("Failed to get user detail: " + e.getMessage());
        }
    }

    /**
     * Get user by ID
     */
    public UserDetailResponse getUserById(String adminUsername, Long userId) {
        try {
            log.info("Admin {} fetching detail for user ID: {}", adminUsername, userId);

            UserProto.UserResponse userResponse = userGrpcClient.getUserById(userId);
            UserProto.User user = userResponse.getUser();

            List<UserDetailResponse.AccountInfo> accounts = new ArrayList<>();
            try {
                AccountProto.AccountResponse accountResponse = transactionGrpcClient.getAccountInfo(userId);
                if (accountResponse != null) {
                    UserDetailResponse.AccountInfo accountInfo = UserDetailResponse.AccountInfo.builder()
                            .accountId(accountResponse.getAccountId())
                            .accountNumber(accountResponse.getAccountNumber())
                            .accountType(accountResponse.getAccountType())
                            .balance(accountResponse.getBalance())
                            .currency(accountResponse.getCurrency())
                            .status(accountResponse.getStatus())
                            .openedDate(accountResponse.getOpenedDate())
                            .build();
                    accounts.add(accountInfo);
                }
            } catch (Exception e) {
                log.warn("Failed to fetch account info for user {}: {}", userId, e.getMessage());
            }

            auditLogger.logSuccess(
                    adminUsername,
                    "VIEW_USER_DETAIL",
                    "USER",
                    String.valueOf(userId),
                    "Viewed user ID: " + userId);

            return UserDetailResponse.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .fullName(user.getFullName())
                    .email(user.getEmail())
                    .phone(user.getPhone())
                    .citizenId(user.getCitizenId())
                    .birthday(user.getBirthday())
                    .isMale(user.getIsMale())
                    .address(user.getAddress())
                    .createAt(user.getCreateAt())
                    .roles(user.getRolesList())
                    .status("ACTIVE") // TODO: Add status field to User proto
                    .accounts(accounts)
                    .build();

        } catch (Exception e) {
            log.error("Failed to get user detail", e);
            auditLogger.logFailure(
                    adminUsername,
                    "VIEW_USER_DETAIL",
                    "USER",
                    String.valueOf(userId),
                    "Failed: " + e.getMessage());
            throw new RuntimeException("Failed to get user detail: " + e.getMessage());
        }
    }

    /**
     * Lock user account temporarily
     *
     * @param adminUsername Admin username performing the action
     * @param userId        User ID to lock
     * @param reason        Reason for locking
     * @param expiresAt     When the lock expires (null for indefinite)
     * @return Updated UserStatus
     */
    public UserStatus lockUser(String adminUsername, Long userId, String reason, LocalDateTime expiresAt) {
        try {
            log.info("Admin {} locking user ID: {} until: {}", adminUsername, userId, expiresAt);

            UserProto.UserResponse userResponse = userGrpcClient.getUserById(userId);
            UserProto.User user = userResponse.getUser();

            UserStatus userStatus = userStatusRepository.findByUserId(userId)
                    .orElse(UserStatus.builder()
                            .userId(userId)
                            .username(user.getUsername())
                            .build());

            userStatus.setStatus(UserStatus.Status.LOCKED);
            userStatus.setStatusReason(reason);
            userStatus.setLockedBy(adminUsername);
            userStatus.setLockedAt(LocalDateTime.now());
            userStatus.setLockExpiresAt(expiresAt);

            UserStatus savedStatus = userStatusRepository.save(userStatus);

            auditLogger.logSuccess(
                    adminUsername,
                    "LOCK_USER",
                    "USER",
                    String.valueOf(userId),
                    "Locked user: " + user.getUsername() + " | Reason: " + reason + " | Expires: " + expiresAt);

            log.info("User {} locked successfully by admin {}", userId, adminUsername);
            return savedStatus;

        } catch (Exception e) {
            log.error("Failed to lock user", e);
            auditLogger.logFailure(
                    adminUsername,
                    "LOCK_USER",
                    "USER",
                    String.valueOf(userId),
                    "Failed: " + e.getMessage());
            throw new RuntimeException("Failed to lock user: " + e.getMessage());
        }
    }

    /**
     * Unlock user account
     *
     * @param adminUsername Admin username performing the action
     * @param userId        User ID to unlock
     * @return Updated UserStatus
     */
    public UserStatus unlockUser(String adminUsername, Long userId) {
        try {
            log.info("Admin {} unlocking user ID: {}", adminUsername, userId);

            UserProto.UserResponse userResponse = userGrpcClient.getUserById(userId);
            UserProto.User user = userResponse.getUser();

            UserStatus userStatus = userStatusRepository.findByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("User status not found for user ID: " + userId));

            if (userStatus.getStatus() != UserStatus.Status.LOCKED) {
                throw new RuntimeException("User is not locked. Current status: " + userStatus.getStatus());
            }

            userStatus.setStatus(UserStatus.Status.ACTIVE);
            userStatus.setStatusReason(null);
            userStatus.setLockedBy(null);
            userStatus.setLockedAt(null);
            userStatus.setLockExpiresAt(null);

            UserStatus savedStatus = userStatusRepository.save(userStatus);

            auditLogger.logSuccess(
                    adminUsername,
                    "UNLOCK_USER",
                    "USER",
                    String.valueOf(userId),
                    "Unlocked user: " + user.getUsername());

            log.info("User {} unlocked successfully by admin {}", userId, adminUsername);
            return savedStatus;

        } catch (Exception e) {
            log.error("Failed to unlock user", e);
            auditLogger.logFailure(
                    adminUsername,
                    "UNLOCK_USER",
                    "USER",
                    String.valueOf(userId),
                    "Failed: " + e.getMessage());
            throw new RuntimeException("Failed to unlock user: " + e.getMessage());
        }
    }

    /**
     * Ban user permanently
     *
     * @param adminUsername Admin username performing the action
     * @param userId        User ID to ban
     * @param reason        Reason for banning
     * @return Updated UserStatus
     */
    public UserStatus banUser(String adminUsername, Long userId, String reason) {
        try {
            log.info("Admin {} banning user ID: {}", adminUsername, userId);

            UserProto.UserResponse userResponse = userGrpcClient.getUserById(userId);
            UserProto.User user = userResponse.getUser();

            // Get or create user status record
            UserStatus userStatus = userStatusRepository.findByUserId(userId)
                    .orElse(UserStatus.builder()
                            .userId(userId)
                            .username(user.getUsername())
                            .build());

            // Update status to BANNED (permanent, no expiry)
            userStatus.setStatus(UserStatus.Status.BANNED);
            userStatus.setStatusReason(reason);
            userStatus.setLockedBy(adminUsername);
            userStatus.setLockedAt(LocalDateTime.now());
            userStatus.setLockExpiresAt(null); // No expiry for ban

            UserStatus savedStatus = userStatusRepository.save(userStatus);

            auditLogger.logSuccess(
                    adminUsername,
                    "BAN_USER",
                    "USER",
                    String.valueOf(userId),
                    "Banned user: " + user.getUsername() + " | Reason: " + reason);

            log.info("User {} banned permanently by admin {}", userId, adminUsername);
            return savedStatus;

        } catch (Exception e) {
            log.error("Failed to ban user", e);
            auditLogger.logFailure(
                    adminUsername,
                    "BAN_USER",
                    "USER",
                    String.valueOf(userId),
                    "Failed: " + e.getMessage());
            throw new RuntimeException("Failed to ban user: " + e.getMessage());
        }
    }

    /**
     * Get user status
     *
     * @param userId User ID
     * @return UserStatus
     */
    public UserStatus getUserStatus(Long userId) {
        return userStatusRepository.findByUserId(userId)
                .orElse(UserStatus.builder()
                        .userId(userId)
                        .status(UserStatus.Status.ACTIVE)
                        .build());
    }
}
