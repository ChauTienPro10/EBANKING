package com.ebanking.admintool.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Environment-specific configuration management
 * Provides centralized access to environment variables and properties
 */
@Configuration
@Getter
public class EnvironmentConfiguration {

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @Value("${app.environment:development}")
    private String environment;

    @Value("${app.version:1.0.0}")
    private String appVersion;

    // Database Configuration
    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username}")
    private String datasourceUsername;

    @Value("${spring.datasource.hikari.maximum-pool-size:20}")
    private Integer hikariMaxPoolSize;

    @Value("${spring.datasource.hikari.minimum-idle:5}")
    private Integer hikariMinIdle;

    // JWT Configuration
    @Value("${jwt.secret.key}")
    private String jwtSecretKey;

    @Value("${jwt.expiration.minutes:30}")
    private Integer jwtExpirationMinutes;

    @Value("${jwt.refresh.days:7}")
    private Integer jwtRefreshDays;

    // gRPC Configuration
    @Value("${grpc.user.service.host:localhost}")
    private String grpcUserServiceHost;

    @Value("${grpc.user.service.port:9001}")
    private Integer grpcUserServicePort;

    @Value("${grpc.transaction.service.host:localhost}")
    private String grpcTransactionServiceHost;

    @Value("${grpc.transaction.service.port:9003}")
    private Integer grpcTransactionServicePort;

    // Rate Limiting Configuration
    @Value("${rate.limiter.max.attempts:5}")
    private Integer rateLimiterMaxAttempts;

    @Value("${rate.limiter.window.minutes:10}")
    private Integer rateLimiterWindowMinutes;

    @Value("${rate.limiter.lock.minutes:10}")
    private Integer rateLimiterLockMinutes;

    // Logging Configuration
    @Value("${logging.level.com.ebanking.admintool:DEBUG}")
    private String logLevel;

    // Actuator Configuration
    @Value("${management.endpoint.health.show-details:when-authorized}")
    private String healthShowDetails;

    /**
     * Check if running in production environment
     */
    public boolean isProduction() {
        return "prod".equalsIgnoreCase(activeProfile) || "production".equalsIgnoreCase(environment);
    }

    /**
     * Check if running in staging environment
     */
    public boolean isStaging() {
        return "staging".equalsIgnoreCase(activeProfile);
    }

    /**
     * Check if running in development environment
     */
    public boolean isDevelopment() {
        return "dev".equalsIgnoreCase(activeProfile) || "development".equalsIgnoreCase(environment);
    }

    /**
     * Get JWT expiration in milliseconds
     */
    public long getJwtExpirationMs() {
        return jwtExpirationMinutes * 60 * 1000L;
    }

    /**
     * Get JWT refresh expiration in milliseconds
     */
    public long getJwtRefreshExpirationMs() {
        return jwtRefreshDays * 24 * 60 * 60 * 1000L;
    }

    /**
     * Get rate limiter window in milliseconds
     */
    public long getRateLimiterWindowMs() {
        return rateLimiterWindowMinutes * 60 * 1000L;
    }

    /**
     * Get rate limiter lock duration in milliseconds
     */
    public long getRateLimiterLockMs() {
        return rateLimiterLockMinutes * 60 * 1000L;
    }
}

