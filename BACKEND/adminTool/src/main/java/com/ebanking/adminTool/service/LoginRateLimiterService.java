package com.ebanking.admintool.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class LoginRateLimiterService {

    private static class Attempt {
        int count;
        long windowStart;
        boolean locked;
        long lockUntil;
    }

    private final Map<String, Attempt> attempts = new ConcurrentHashMap<>();

    @Value("${rate.limiter.max.attempts:5}")
    private int maxAttempts;

    @Value("${rate.limiter.window.minutes:10}")
    private int windowMinutes;

    @Value("${rate.limiter.lock.minutes:10}")
    private int lockMinutes;

    private long windowMillis;
    private long lockMillis;

    @PostConstruct
    public void init() {
        this.windowMillis = windowMinutes * 60L * 1000L;
        this.lockMillis = lockMinutes * 60L * 1000L;
    }

    public void checkAllowed(String key) {
        long now = Instant.now().toEpochMilli();
        Attempt a = attempts.computeIfAbsent(key, k -> new Attempt());
        if (a.locked && now < a.lockUntil) {
            throw new RuntimeException("Too many failed attempts. Try again later.");
        }
        if (a.windowStart == 0 || (now - a.windowStart > windowMillis)) {
            a.windowStart = now;
            a.count = 0;
            a.locked = false;
        }
    }

    public void onFailure(String key) {
        long now = Instant.now().toEpochMilli();
        Attempt a = attempts.computeIfAbsent(key, k -> new Attempt());
        if (a.windowStart == 0 || (now - a.windowStart > windowMillis)) {
            a.windowStart = now;
            a.count = 0;
            a.locked = false;
        }
        a.count++;
        if (a.count >= maxAttempts) {
            a.locked = true;
            a.lockUntil = now + lockMillis;
        }
        attempts.put(key, a);
    }

    public void onSuccess(String key) {
        attempts.remove(key);
    }
}
