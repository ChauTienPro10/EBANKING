package com.example.auth.repository;

import com.example.auth.entity.NotifyStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotifyStatusRepository extends JpaRepository<NotifyStatus, Long> {
    boolean existsByUserIdAndNotifyId(Long userId, Long notifyId);

    NotifyStatus findByUserIdAndNotifyId(Long userId, Long notifyId);
}
