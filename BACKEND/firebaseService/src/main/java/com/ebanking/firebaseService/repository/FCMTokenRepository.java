package com.ebanking.firebaseService.repository;

import com.ebanking.firebaseService.entity.FCMToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FCMTokenRepository extends JpaRepository<FCMToken, Long> {
    
    Optional<FCMToken> findByToken(String token);
    
    Optional<FCMToken> findByUserId(Long userId);
    
    Optional<FCMToken> findByUsername(String username);
    
    void deleteByToken(String token);

    FCMToken findByDeviceId(String deviceId);

    @Query("SELECT f.token FROM FCMToken f")
    List<String> getAllTokenStr();
}
