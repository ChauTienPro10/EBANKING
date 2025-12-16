package com.ebanking.admintool.service;

import com.ebanking.admintool.repository.LoginAttemptRepository;
import com.ebanking.admintool.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Slf4j
@RequiredArgsConstructor
public class CleanupScheduler {

    private final RefreshTokenRepository refreshTokenRepository;
    private final LoginAttemptRepository loginAttemptRepository;

    /**
     * Cleanup expired refresh tokens
     * Runs daily at 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void cleanupExpiredRefreshTokens() {
        try {
            LocalDateTime now = LocalDateTime.now();
            int deleted = refreshTokenRepository.deleteByRevokedTrueOrExpiresAtBefore(now);
            log.info("Cleaned up {} expired/revoked refresh tokens", deleted);
        } catch (Exception e) {
            log.error("Failed to cleanup refresh tokens", e);
        }
    }

    /**
     * Cleanup old login attempts
     * Runs daily at 3:00 AM, removes records older than 30 days
     */
    @Scheduled(cron = "0 0 3 * * ?")
    @Transactional
    public void cleanupOldLoginAttempts() {
        try {
            LocalDateTime threshold = LocalDateTime.now().minusDays(30);
            int deleted = loginAttemptRepository.deleteByLastAttemptBefore(threshold);
            log.info("Cleaned up {} old login attempt records", deleted);
        } catch (Exception e) {
            log.error("Failed to cleanup login attempts", e);
        }
    }

    /**
     * Cleanup unlocked accounts (remove lock after expiry)
     * Runs every hour
     */
    @Scheduled(cron = "0 0 * * * ?")
    @Transactional
    public void cleanupUnlockedAccounts() {
        try {
            LocalDateTime now = LocalDateTime.now();
            int unlocked = loginAttemptRepository.resetExpiredLocks(now);
            if (unlocked > 0) {
                log.info("Reset {} expired account locks", unlocked);
            }
        } catch (Exception e) {
            log.error("Failed to reset expired locks", e);
        }
    }
}
