package com.ebanking.firebaseService.repository;

import com.ebanking.firebaseService.entity.NotiSystem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotiSystemRepository extends JpaRepository<NotiSystem, Long> {

}
