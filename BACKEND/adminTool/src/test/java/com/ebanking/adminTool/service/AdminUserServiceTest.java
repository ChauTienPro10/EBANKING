package com.ebanking.admintool.service;

import com.banking.userService.grpc.UserProto;
import com.ebanking.admintool.entity.UserStatus;
import com.ebanking.admintool.repository.UserStatusRepository;
import com.ebanking.admintool.service.grpc.UserGrpcClient;
import com.ebanking.admintool.utils.AuditLogger;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AdminUserService
 */
@ExtendWith(MockitoExtension.class)
public class AdminUserServiceTest {

    @Mock
    private UserGrpcClient userGrpcClient;

    @Mock
    private UserStatusRepository userStatusRepository;

    @Mock
    private AuditLogger auditLogger;

    @InjectMocks
    private AdminUserService adminUserService;

    private static final String ADMIN_USERNAME = "admin_user";
    private static final Long USER_ID = 123L;
    private static final String USERNAME = "john_doe";

    @BeforeEach
    public void setUp() {
        // Setup common test data
    }

    @Test
    public void testLockUserSuccess() {
        // Arrange
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(24);
        String reason = "Suspicious activity";

        UserProto.User user = UserProto.User.newBuilder()
                .setId(USER_ID)
                .setUsername(USERNAME)
                .build();

        UserProto.UserResponse userResponse = UserProto.UserResponse.newBuilder()
                .setUser(user)
                .build();

        UserStatus userStatus = UserStatus.builder()
                .userId(USER_ID)
                .username(USERNAME)
                .status(UserStatus.Status.LOCKED)
                .statusReason(reason)
                .lockedBy(ADMIN_USERNAME)
                .lockExpiresAt(expiresAt)
                .build();

        when(userGrpcClient.getUserById(USER_ID)).thenReturn(userResponse);
        when(userStatusRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());
        when(userStatusRepository.save(any())).thenReturn(userStatus);

        // Act
        UserStatus result = adminUserService.lockUser(ADMIN_USERNAME, USER_ID, reason, expiresAt);

        // Assert
        assertNotNull(result);
        assertEquals(UserStatus.Status.LOCKED, result.getStatus());
        assertEquals(reason, result.getStatusReason());
        assertEquals(ADMIN_USERNAME, result.getLockedBy());
        assertEquals(expiresAt, result.getLockExpiresAt());

        // Verify
        verify(userGrpcClient).getUserById(USER_ID);
        verify(userStatusRepository).save(any());
        verify(auditLogger).logSuccess(anyString(), eq("LOCK_USER"), anyString(), anyString(), anyString());
    }

    @Test
    public void testUnlockUserSuccess() {
        // Arrange
        UserProto.User user = UserProto.User.newBuilder()
                .setId(USER_ID)
                .setUsername(USERNAME)
                .build();

        UserProto.UserResponse userResponse = UserProto.UserResponse.newBuilder()
                .setUser(user)
                .build();

        UserStatus lockedStatus = UserStatus.builder()
                .userId(USER_ID)
                .username(USERNAME)
                .status(UserStatus.Status.LOCKED)
                .statusReason("Test lock")
                .lockedBy(ADMIN_USERNAME)
                .build();

        UserStatus unlockedStatus = UserStatus.builder()
                .userId(USER_ID)
                .username(USERNAME)
                .status(UserStatus.Status.ACTIVE)
                .statusReason(null)
                .lockedBy(null)
                .build();

        when(userGrpcClient.getUserById(USER_ID)).thenReturn(userResponse);
        when(userStatusRepository.findByUserId(USER_ID)).thenReturn(Optional.of(lockedStatus));
        when(userStatusRepository.save(any())).thenReturn(unlockedStatus);

        // Act
        UserStatus result = adminUserService.unlockUser(ADMIN_USERNAME, USER_ID);

        // Assert
        assertNotNull(result);
        assertEquals(UserStatus.Status.ACTIVE, result.getStatus());
        assertNull(result.getStatusReason());
        assertNull(result.getLockedBy());

        // Verify
        verify(userGrpcClient).getUserById(USER_ID);
        verify(userStatusRepository).save(any());
        verify(auditLogger).logSuccess(anyString(), eq("UNLOCK_USER"), anyString(), anyString(), anyString());
    }

    @Test
    public void testUnlockUserNotLocked() {
        // Arrange
        UserProto.User user = UserProto.User.newBuilder()
                .setId(USER_ID)
                .setUsername(USERNAME)
                .build();

        UserProto.UserResponse userResponse = UserProto.UserResponse.newBuilder()
                .setUser(user)
                .build();

        UserStatus activeStatus = UserStatus.builder()
                .userId(USER_ID)
                .username(USERNAME)
                .status(UserStatus.Status.ACTIVE)
                .build();

        when(userGrpcClient.getUserById(USER_ID)).thenReturn(userResponse);
        when(userStatusRepository.findByUserId(USER_ID)).thenReturn(Optional.of(activeStatus));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            adminUserService.unlockUser(ADMIN_USERNAME, USER_ID);
        });

        verify(auditLogger).logFailure(anyString(), eq("UNLOCK_USER"), anyString(), anyString(), anyString());
    }

    @Test
    public void testBanUserSuccess() {
        // Arrange
        String reason = "Fraud detected";

        UserProto.User user = UserProto.User.newBuilder()
                .setId(USER_ID)
                .setUsername(USERNAME)
                .build();

        UserProto.UserResponse userResponse = UserProto.UserResponse.newBuilder()
                .setUser(user)
                .build();

        UserStatus bannedStatus = UserStatus.builder()
                .userId(USER_ID)
                .username(USERNAME)
                .status(UserStatus.Status.BANNED)
                .statusReason(reason)
                .lockedBy(ADMIN_USERNAME)
                .lockExpiresAt(null)
                .build();

        when(userGrpcClient.getUserById(USER_ID)).thenReturn(userResponse);
        when(userStatusRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());
        when(userStatusRepository.save(any())).thenReturn(bannedStatus);

        // Act
        UserStatus result = adminUserService.banUser(ADMIN_USERNAME, USER_ID, reason);

        // Assert
        assertNotNull(result);
        assertEquals(UserStatus.Status.BANNED, result.getStatus());
        assertEquals(reason, result.getStatusReason());
        assertEquals(ADMIN_USERNAME, result.getLockedBy());
        assertNull(result.getLockExpiresAt());

        // Verify
        verify(userGrpcClient).getUserById(USER_ID);
        verify(userStatusRepository).save(any());
        verify(auditLogger).logSuccess(anyString(), eq("BAN_USER"), anyString(), anyString(), anyString());
    }

    @Test
    public void testGetUserStatusExists() {
        // Arrange
        UserStatus userStatus = UserStatus.builder()
                .userId(USER_ID)
                .username(USERNAME)
                .status(UserStatus.Status.LOCKED)
                .build();

        when(userStatusRepository.findByUserId(USER_ID)).thenReturn(Optional.of(userStatus));

        // Act
        UserStatus result = adminUserService.getUserStatus(USER_ID);

        // Assert
        assertNotNull(result);
        assertEquals(USER_ID, result.getUserId());
        assertEquals(UserStatus.Status.LOCKED, result.getStatus());
    }

    @Test
    public void testGetUserStatusNotExists() {
        // Arrange
        when(userStatusRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());

        // Act
        UserStatus result = adminUserService.getUserStatus(USER_ID);

        // Assert
        assertNotNull(result);
        assertEquals(USER_ID, result.getUserId());
        assertEquals(UserStatus.Status.ACTIVE, result.getStatus());
    }
}

