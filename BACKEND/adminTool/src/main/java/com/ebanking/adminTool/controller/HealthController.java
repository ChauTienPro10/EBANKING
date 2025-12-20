package com.ebanking.adminTool.controller;

import com.ebanking.adminTool.config.EnvironmentConfiguration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

/**
 * Health Check Controller
 * Provides application health status and system information
 */
@RestController
@RequestMapping("")
@Slf4j
@RequiredArgsConstructor
public class HealthController {

    private final EnvironmentConfiguration envConfig;

    /**
     * Health check endpoint
     * Returns application status and basic information
     */
    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "adminTool");
        response.put("timestamp", Instant.now().toString());
        response.put("version", envConfig.getAppVersion());
        response.put("environment", envConfig.getEnvironment());
        response.put("profile", envConfig.getActiveProfile());
        return response;
    }

    /**
     * System information endpoint
     * Returns detailed system configuration (for authorized users only)
     */
    @GetMapping("/system-info")
    public Map<String, Object> systemInfo() {
        Map<String, Object> response = new HashMap<>();
        response.put("timestamp", Instant.now().toString());
        response.put("environment", envConfig.getEnvironment());
        response.put("profile", envConfig.getActiveProfile());
        response.put("version", envConfig.getAppVersion());
        response.put("javaVersion", System.getProperty("java.version"));
        response.put("osName", System.getProperty("os.name"));
        response.put("osVersion", System.getProperty("os.version"));
        response.put("availableProcessors", Runtime.getRuntime().availableProcessors());
        response.put("totalMemory", Runtime.getRuntime().totalMemory());
        response.put("freeMemory", Runtime.getRuntime().freeMemory());
        response.put("maxMemory", Runtime.getRuntime().maxMemory());
        return response;
    }
}
