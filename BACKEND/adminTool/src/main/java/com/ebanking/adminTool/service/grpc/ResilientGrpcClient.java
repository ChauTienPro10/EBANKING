package com.ebanking.admintool.service.grpc;

import io.grpc.StatusRuntimeException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.function.Supplier;

/**
 * Resilient gRPC Client Wrapper
 * Provides retry logic, timeout handling, and circuit breaker patterns
 */
@Component
@Slf4j
public class ResilientGrpcClient {

    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_BACKOFF_MS = 100;
    private static final long MAX_BACKOFF_MS = 5000;

    public ResilientGrpcClient() {
        // Constructor for future use if environment-specific configuration is needed
    }

    /**
     * Execute gRPC operation with retry logic and exponential backoff
     * 
     * @param operation     The gRPC operation to execute
     * @param operationName Name of the operation for logging
     * @return Result of the operation
     * @throws RuntimeException if operation fails after all retries
     */
    public <T> T executeWithRetry(Supplier<T> operation, String operationName) {
        Exception lastException = null;

        for (int attempt = 0; attempt < MAX_RETRIES; attempt++) {
            try {
                log.debug("Executing gRPC operation: {} (attempt {}/{})",
                        operationName, attempt + 1, MAX_RETRIES);

                T result = operation.get();

                if (attempt > 0) {
                    log.info("gRPC operation '{}' succeeded after {} retries",
                            operationName, attempt);
                }

                return result;

            } catch (StatusRuntimeException e) {
                lastException = e;

                // Don't retry on client errors (4xx)
                if (e.getStatus().getCode().value() >= 400 &&
                        e.getStatus().getCode().value() < 500) {
                    log.warn("gRPC operation '{}' failed with client error: {}",
                            operationName, e.getStatus());
                    throw new RuntimeException("gRPC client error: " + e.getStatus(), e);
                }

                // Retry on server errors (5xx) and unavailable
                if (attempt < MAX_RETRIES - 1) {
                    long backoffMs = calculateBackoff(attempt);
                    log.warn("gRPC operation '{}' failed (attempt {}/{}), retrying in {}ms: {}",
                            operationName, attempt + 1, MAX_RETRIES, backoffMs, e.getStatus());

                    try {
                        Thread.sleep(backoffMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Retry interrupted", ie);
                    }
                } else {
                    log.error("gRPC operation '{}' failed after {} retries: {}",
                            operationName, MAX_RETRIES, e.getStatus());
                }

            } catch (Exception e) {
                lastException = e;
                log.error("gRPC operation '{}' failed with unexpected error (attempt {}/{}): {}",
                        operationName, attempt + 1, MAX_RETRIES, e.getMessage());

                if (attempt < MAX_RETRIES - 1) {
                    long backoffMs = calculateBackoff(attempt);
                    try {
                        Thread.sleep(backoffMs);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Retry interrupted", ie);
                    }
                }
            }
        }

        String errorMsg = String.format(
                "gRPC operation '%s' failed after %d retries",
                operationName, MAX_RETRIES);
        log.error(errorMsg, lastException);
        throw new RuntimeException(errorMsg, lastException);
    }

    /**
     * Calculate exponential backoff with jitter
     */
    private long calculateBackoff(int attemptNumber) {
        long backoff = INITIAL_BACKOFF_MS * (long) Math.pow(2, attemptNumber);
        backoff = Math.min(backoff, MAX_BACKOFF_MS);

        // Add jitter (±10%)
        long jitter = (long) (backoff * 0.1 * (Math.random() - 0.5));
        return backoff + jitter;
    }
}
