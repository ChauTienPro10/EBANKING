package com.ebanking.chatService.client;

import com.banking.userService.grpc.UserProto;
import com.banking.userService.grpc.UserServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import io.grpc.StatusRuntimeException;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class UserGrpcClient {

    @Value("${grpc.user-service.host:localhost}")
    private String userServiceHost;

    @Value("${grpc.user-service.port:9001}")
    private int userServicePort;

    @Value("${grpc.user-service.timeout:5}")
    private int timeoutSeconds;

    private ManagedChannel channel;
    private UserServiceGrpc.UserServiceBlockingStub userStub;

    @PostConstruct
    public void init() {
        try {
            channel = ManagedChannelBuilder
                    .forAddress(userServiceHost, userServicePort)
                    .usePlaintext()
                    .keepAliveTime(60, TimeUnit.SECONDS)
                    .keepAliveTimeout(20, TimeUnit.SECONDS)
                    .build();

            // Don't set deadline here - set it per request
            userStub = UserServiceGrpc.newBlockingStub(channel);

            log.info("✓ UserGrpcClient initialized successfully: {}:{}", userServiceHost, userServicePort);

            // Test connection
            testConnection();
        } catch (Exception e) {
            log.error("✗ Failed to initialize UserGrpcClient: {}:{} - {}",
                    userServiceHost, userServicePort, e.getMessage());
        }
    }

    @PreDestroy
    public void shutdown() {
        if (channel != null && !channel.isShutdown()) {
            try {
                channel.shutdown();
                if (!channel.awaitTermination(5, TimeUnit.SECONDS)) {
                    channel.shutdownNow();
                }
                log.info("UserGrpcClient channel shutdown successfully");
            } catch (InterruptedException e) {
                log.warn("Channel shutdown interrupted");
                channel.shutdownNow();
                Thread.currentThread().interrupt();
            }
        }
    }

    /**
     * Test gRPC connection on startup
     */
    private void testConnection() {
        try {
            // Test with a dummy userId to verify connection
            UserProto.GetUserRequestById testRequest = UserProto.GetUserRequestById.newBuilder()
                    .setUserId(1L)
                    .build();
            userStub.getUserById(testRequest);
            log.info("✓ gRPC connection to userService verified");
        } catch (StatusRuntimeException e) {
            if (e.getStatus().getCode() == io.grpc.Status.Code.NOT_FOUND) {
                // User not found is OK - connection works
                log.info("✓ gRPC connection to userService verified (test user not found, connection OK)");
            } else {
                log.error("✗ gRPC connection test failed: {} - {}", e.getStatus().getCode(), e.getMessage());
            }
        } catch (Exception e) {
            log.error("✗ gRPC connection test failed: {}", e.getMessage());
        }
    }

    /**
     * Get full name by userId with retry logic
     *
     * @param userId the user ID
     * @return full name or null if not found
     */
    public String getFullNameById(Long userId) {
        int maxRetries = 3;
        int retryCount = 0;

        while (retryCount < maxRetries) {
            try {
                UserProto.GetUserRequestById request = UserProto.GetUserRequestById.newBuilder()
                        .setUserId(userId)
                        .build();

                // Set deadline per request, not in init()
                UserServiceGrpc.UserServiceBlockingStub stubWithDeadline = userStub.withDeadlineAfter(timeoutSeconds,
                        TimeUnit.SECONDS);

                UserProto.UserResponse response = stubWithDeadline.getUserById(request);

                if (response != null && response.hasUser()) {
                    log.debug("Successfully retrieved full name for userId: {}", userId);
                    return response.getUser().getFullName();
                }
                log.warn("User not found for userId: {}", userId);
                return null;
            } catch (StatusRuntimeException e) {
                retryCount++;
                String errorCode = e.getStatus().getCode().name();

                if ((errorCode.equals("UNAVAILABLE") || errorCode.equals("DEADLINE_EXCEEDED"))
                        && retryCount < maxRetries) {
                    log.warn("Failed to get full name for userId {} (attempt {}/{}): {} - Retrying...",
                            userId, retryCount, maxRetries, e.getMessage());
                    try {
                        Thread.sleep(500 * retryCount); // Exponential backoff
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        break;
                    }
                } else {
                    log.error("Failed to get full name for userId {}: {} - {}",
                            userId, errorCode, e.getMessage());
                    return null;
                }
            } catch (Exception e) {
                log.error("Unexpected error getting full name for userId {}: {}",
                        userId, e.getMessage());
                return null;
            }
        }

        log.error("Failed to get full name for userId {} after {} retries", userId, maxRetries);
        return null;
    }

    /**
     * Check if the gRPC channel is ready
     *
     * @return true if channel is ready, false otherwise
     */
    public boolean isChannelReady() {
        return channel != null && !channel.isShutdown() && !channel.isTerminated();
    }
}
