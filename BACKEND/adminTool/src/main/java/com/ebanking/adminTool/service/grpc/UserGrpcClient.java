package com.ebanking.adminTool.service.grpc;

import com.banking.userService.grpc.UserProto;
import com.banking.userService.grpc.UserServiceGrpc;
import com.ebanking.adminTool.config.GrpcConfig;
import com.ebanking.adminTool.dto.UserInfoDto;
import com.google.protobuf.Empty;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class UserGrpcClient {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd-MM-yyyy");

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

    public List<UserInfoDto> getAllUsers() {
        return resilientClient.executeWithRetry(() -> {
            UserProto.UserList response = userStub.getAllUsers(Empty.getDefaultInstance());
            return response.getUsersList().stream()
                    .map(this::mapToUserInfoDto)
                    .collect(Collectors.toList());
        }, "getAllUsers");
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

    // ===== Mapping helpers =====

    private UserInfoDto mapToUserInfoDto(UserProto.User user) {
        UserInfoDto dto = new UserInfoDto();
        dto.setId(user.getId());
        dto.setUserId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setCitizenId(user.getCitizenId());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setIsMale(user.getIsMale());
        dto.setAddress(user.getAddress());

        dto.setBirthday(parseDateToEpoch(user.getBirthday(), "birthday", user.getId()));
        dto.setCreateAt(parseDateToEpoch(user.getCreateAt(), "createAt", user.getId()));

        // Fields not provided by gRPC will remain null (ekyc, avatar, dailyTransactionLimit,...)
        return dto;
    }

    private Long parseDateToEpoch(String dateStr, String fieldName, long userId) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        try {
            LocalDate date = LocalDate.parse(dateStr, DATE_FORMATTER);
            return date.atStartOfDay().toInstant(ZoneOffset.UTC).toEpochMilli();
        } catch (Exception e) {
            log.warn("Failed to parse {} for user {}: {}", fieldName, userId, e.getMessage());
            return null;
        }
    }
}
