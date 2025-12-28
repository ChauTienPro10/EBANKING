package com.example.auth.repository;

import com.example.auth.entity.TransactionPayload;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionPayloadRepository extends JpaRepository<TransactionPayload, Long> {
    TransactionPayload findByUsername(String username);
}
