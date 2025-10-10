package com.ebanking.firebaseService.repository;

import com.ebanking.firebaseService.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    
    Page<Notification> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);
    
    Page<Notification> findByUsernameOrderByCreatedAtDesc(String username, Pageable pageable);
    
    
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);
    
    
    List<Notification> findByUsernameOrderByCreatedAtDesc(String username);
    
    
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(Long userId);
    
    List<Notification> findByUsernameAndIsReadFalseOrderByCreatedAtDesc(String username);
    
    long countByUserIdAndIsReadFalse(Long userId);
    
    long countByUsernameAndIsReadFalse(String username);
    
    Optional<Notification> findByIdAndUserId(Long id, Long userId);
    
    Optional<Notification> findByIdAndUsername(Long id, String username);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.id = :id")
    int markAsRead(@Param("id") Long id);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.userId = :userId AND n.isRead = false")
    int markAllAsReadByUserId(@Param("userId") Long userId);
    
    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true, n.readAt = CURRENT_TIMESTAMP WHERE n.username = :username AND n.isRead = false")
    int markAllAsReadByUsername(@Param("username") String username);
    
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.userId = :userId AND n.isRead = true")
    int deleteAllReadByUserId(@Param("userId") Long userId);
    
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.username = :username AND n.isRead = true")
    int deleteAllReadByUsername(@Param("username") String username);
    
    int deleteByIdAndUserId(Long id, Long userId);
    
    int deleteByIdAndUsername(Long id, String username);
}

