package com.ebanking.adminTool.service;

import com.ebanking.adminTool.entity.RefreshToken;
import com.ebanking.adminTool.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${jwt.refresh.days:7}")
    private int refreshDays;

    public RefreshToken createForUser(String username) {
        refreshTokenRepository.deleteByUsername(username);
        RefreshToken token = RefreshToken.builder()
                .username(username)
                .token(UUID.randomUUID().toString())
                .expiresAt(LocalDateTime.now().plusDays(refreshDays))
                .revoked(false)
                .build();
        return refreshTokenRepository.save(token);
    }

    public RefreshToken rotate(String oldToken) {
        RefreshToken existing = refreshTokenRepository.findByToken(oldToken)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));
        if (existing.isRevoked() || existing.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Refresh token expired or revoked");
        }
        existing.setRevoked(true);
        refreshTokenRepository.save(existing);
        return createForUser(existing.getUsername());
    }
}
