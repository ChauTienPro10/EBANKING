package com.ebanking.ekycservice.repository;

import com.ebanking.ekycservice.entity.EkycSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EkycSessionRepository extends JpaRepository<EkycSession, UUID> {
}
