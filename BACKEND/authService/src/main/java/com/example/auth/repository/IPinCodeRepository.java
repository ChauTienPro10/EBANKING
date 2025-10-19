package com.example.auth.repository;

import com.example.auth.entity.PinCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IPinCodeRepository extends JpaRepository<PinCode, Long> {

    PinCode findByUserId(long userId);
}
