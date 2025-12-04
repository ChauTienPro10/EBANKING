package com.ebanking.admintool.service.grpc;

import com.banking.userService.grpc.UserProto;
import com.banking.userService.grpc.UserServiceGrpc;
import com.ebanking.admintool.config.GrpcConfig;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

/**
 * gRPC Client for User Service
 */
@Service
@Slf4j
public class UserGrpcClient {

    private final GrpcConfig grpcConfig;
    private ManagedChannel channel;
    private UserServiceGrpc.UserServiceBlockingStub userStub;

    public UserGrpcClient(GrpcConfig grpcConfig) {
        this.grpcConfig = grpcConfig;
    }

    @PostConstruct
    public void init() {
        channel = ManagedChannelBuilder
                .forAddress(grpcConfig.getUserServiceHost(), grpcConfig.getUserServicePort())
                .usePlaintext()
                .build();

        userStub = UserServiceGrpc.newBlockingStub(channel);
        log.info("UserGrpcClient initialized: {}:{}",
                grpcConfig.getUserServiceHost(), grpcConfig.getUserServicePort());
    }

    @PreDestroy
    public void shutdown() {
        if (channel != null && !channel.isShutdown()) {
            channel.shutdown();
            log.info("UserGrpcClient channel shutdown");
        }
    }

    /**
     * Login user
     */
    public UserProto.LoginResponse login(String username, String password) {
        UserProto.LoginRequest request = UserProto.LoginRequest.newBuilder()
                .setUsername(username)
                .setPassword(password)
                .build();
        return userStub.login(request);
    }

    /**
     * Get user by ID
     */
    public UserProto.UserResponse getUserById(Long userId) {
        UserProto.GetUserRequestById request = UserProto.GetUserRequestById.newBuilder()
                .setUserId(userId)
                .build();
        return userStub.getUserById(request);
    }

    /**
     * Get user ID by username
     */
    public long getUserIdByUsername(String username) {
        UserProto.GetUserIdByUsernameRequest request = UserProto.GetUserIdByUsernameRequest.newBuilder()
                .setUsername(username)
                .build();
        UserProto.GetUserIdByUsernameResponse response = userStub.getUserIdByUsername(request);
        // NOTE: userId is defined as float in proto. This is lossy for large IDs.
        // Use Math.round to reduce precision issues and log a warning once.
        float userIdFloat = response.getUserId();
        long userId = Math.round(userIdFloat);
        if (Math.abs(userIdFloat - userId) > 0.0001f) {
            log.warn("User ID precision loss when converting float to long for username={}: {} -> {}", username,
                    userIdFloat, userId);
        }
        if (userId < 0) {
            throw new IllegalStateException("Invalid userId returned from user service: " + userIdFloat);
        }
        return userId;
    }

    /**
     * Check if user exists
     */
    public boolean checkUserExist(String username) {
        UserProto.CheckUserExistRequest request = UserProto.CheckUserExistRequest.newBuilder()
                .setUsername(username)
                .build();
        UserProto.CheckUserExistResponse response = userStub.checkUserExist(request);
        return response.getIsExist();
    }

    /**
     * Update user info
     */
    public UserProto.User updateUserInfo(UserProto.User user) {
        return userStub.updateUserInfo(user);
    }

    /**
     * Verify password
     */
    public boolean verifyPassword(String username, String password) {
        UserProto.VerifyPasswordRequest request = UserProto.VerifyPasswordRequest.newBuilder()
                .setUsername(username)
                .setPassword(password)
                .build();
        UserProto.VerifyPasswordResponse response = userStub.verifyPassword(request);
        return response.getStatus();
    }
}
