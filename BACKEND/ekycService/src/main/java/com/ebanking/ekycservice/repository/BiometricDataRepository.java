package com.ebanking.ekycservice.repository;

import com.ebanking.ekycservice.entity.BiometricData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BiometricDataRepository extends JpaRepository<BiometricData, String> {
    Optional<BiometricData> findBySessionId(UUID sessionId);
}
