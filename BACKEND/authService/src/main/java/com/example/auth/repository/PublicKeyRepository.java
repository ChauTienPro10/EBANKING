package com.example.auth.repository;

import com.example.auth.entity.PublicKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PublicKeyRepository extends JpaRepository<PublicKey, Long> {
    PublicKey findByUsername(String username);
}
