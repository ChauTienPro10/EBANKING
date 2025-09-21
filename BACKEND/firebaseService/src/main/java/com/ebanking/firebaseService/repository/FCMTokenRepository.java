package com.ebanking.firebaseService.repository;

import com.ebanking.firebaseService.entity.FCMToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FCMTokenRepository extends JpaRepository<Long, FCMToken> {
}
