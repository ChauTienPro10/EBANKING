package com.ebanking.ekycservice.repository;

import com.ebanking.ekycservice.entity.BiometricData;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BiometricDataRepository extends JpaRepository<BiometricData, String> {
}
