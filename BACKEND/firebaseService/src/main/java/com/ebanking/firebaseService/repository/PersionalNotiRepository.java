package com.ebanking.firebaseService.repository;

import com.ebanking.firebaseService.entity.PersionalNoti;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersionalNotiRepository extends JpaRepository<PersionalNoti, Long> {

    @Query("SELECT p FROM PersionalNoti p WHERE p.username = :username ORDER BY p.createdAt DESC")
    List<PersionalNoti> findByUsernameOrderByCreatedAtDesc(@Param("username") String username, Pageable pageable);

    @Query("SELECT p FROM PersionalNoti p WHERE p.username = :username ORDER BY p.createdAt DESC")
    List<PersionalNoti> findByUsernameOrderByCreatedAtDesc(@Param("username") String username);
}
