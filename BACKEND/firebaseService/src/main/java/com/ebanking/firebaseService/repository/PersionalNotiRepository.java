package com.ebanking.firebaseService.repository;

import com.ebanking.firebaseService.entity.PersionalNoti;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersionalNotiRepository extends JpaRepository<PersionalNoti, Long> {


}
