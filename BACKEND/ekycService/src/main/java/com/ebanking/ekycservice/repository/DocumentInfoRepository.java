package com.ebanking.ekycservice.repository;

import com.ebanking.ekycservice.entity.DocumentInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentInfoRepository extends JpaRepository<DocumentInfo, Long> {
}
