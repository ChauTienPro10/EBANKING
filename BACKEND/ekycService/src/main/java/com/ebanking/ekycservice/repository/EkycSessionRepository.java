package com.ebanking.ekycservice.repository;

import com.ebanking.ekycservice.entity.EkycSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import javax.swing.text.html.Option;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EkycSessionRepository extends JpaRepository<EkycSession, UUID> {

    Optional<EkycSession> findByUserIdAndStatus(Long userId, com.ebanking.ekycservice.constant.EkycStatus status);
}
