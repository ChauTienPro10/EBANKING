package com.ebanking.adminTool.service.grpc;

import com.banking.userService.grpc.UserProto;
import com.banking.userService.grpc.UserServiceGrpc;
import com.ebanking.adminTool.config.GrpcConfig;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

@Service
@Slf4j
public class UserGrpcClient {

    private final GrpcConfig grpcConfig;
    private final ResilientGrpcClient resilientClient;
    private ManagedChannel channel;
    private UserServiceGrpc.UserServiceBlockingStub userStub;

    public UserGrpcClient(GrpcConfig grpcConfig, ResilientGrpcClient resilientClient) {
        this.grpcConfig = grpcConfig;
        this.resilientClient = resilientClient;
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

    public UserProto.UserResponse getUserById(Long userId) {
        return resilientClient.executeWithRetry(() -> {
            UserProto.GetUserRequestById request = UserProto.GetUserRequestById.newBuilder()
                    .setUserId(userId)
                    .build();
            return userStub.getUserById(request);
        }, "getUserById");
    }

    public UserProto.CheckUserExistResponse checkUserExist(String username) {
        return resilientClient.executeWithRetry(() -> {
            UserProto.CheckUserExistRequest request = UserProto.CheckUserExistRequest.newBuilder()
                    .setUsername(username)
                    .build();
            return userStub.checkUserExist(request);
        }, "checkUserExist");
    }

    public UserProto.GetUserIdByUsernameResponse getUserIdByUsername(String username) {
        return resilientClient.executeWithRetry(() -> {
            UserProto.GetUserIdByUsernameRequest request = UserProto.GetUserIdByUsernameRequest.newBuilder()
                    .setUsername(username)
                    .build();
            return userStub.getUserIdByUsername(request);
        }, "getUserIdByUsername");
    }
}
