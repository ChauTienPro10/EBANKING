package com.example.auth.repository;

import com.example.auth.entity.LockAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LockAccountRepository extends JpaRepository<LockAccount, Long> {
}
