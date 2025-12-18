package com.ebanking.adminTool.repository;

import com.ebanking.adminTool.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUsername(String username);
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM RefreshToken r WHERE r.revoked = true OR r.expiresAt < :now")
    int deleteByRevokedTrueOrExpiresAtBefore(@org.springframework.data.repository.query.Param("now") java.time.LocalDateTime now);
}

