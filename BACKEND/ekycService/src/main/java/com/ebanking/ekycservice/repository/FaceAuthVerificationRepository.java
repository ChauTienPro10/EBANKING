package com.ebanking.ekycservice.repository;

import com.ebanking.ekycservice.entity.FaceAuthVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FaceAuthVerificationRepository extends JpaRepository<FaceAuthVerification, Long> {
    Optional<FaceAuthVerification> findBySessionId(String sessionId);
}
