package com.ebanking.admintool.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

@Component
@Getter
public class ApplicationInfo {
    private Instant startTime;

    @Value("${app.version:unknown}")
    private String version;

    @PostConstruct
    public void init() {
        startTime = Instant.now();
    }

    public Duration getUptime() {
        return Duration.between(startTime, Instant.now());
    }
}

