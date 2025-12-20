package com.ebanking.firebaseService.repository;

import com.ebanking.firebaseService.entity.NotiSystem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotiSystemRepository extends JpaRepository<NotiSystem, Long> {
    List<NotiSystem> findAll();

    @Query("""
    SELECT n
    FROM NotiSystem n
    WHERE n.createdAt >= :fromDate
          AND n.createdAt <= :toDate
    """)
    List<NotiSystem> findFromDateToDate(
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate
    );
}
