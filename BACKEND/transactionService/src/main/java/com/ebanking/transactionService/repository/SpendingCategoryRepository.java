package com.ebanking.transactionService.repository;

import com.ebanking.transactionService.entity.SpendingCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpendingCategoryRepository extends JpaRepository<SpendingCategory, String> {
    
    /**
     * Find all active categories for a specific user, ordered by name
     */
    List<SpendingCategory> findByUserIdAndIsActiveOrderByNameAsc(Long userId, Boolean isActive);
    
    /**
     * Find a category by user ID and code
     */
    Optional<SpendingCategory> findByUserIdAndCode(Long userId, String code);
    
    /**
     * Find a category by user ID and category ID
     */
    @Query("SELECT c FROM SpendingCategory c WHERE c.userId = :userId AND c.id = :id")
    Optional<SpendingCategory> findByUserIdAndId(@Param("userId") Long userId, @Param("id") String id);
    
    /**
     * Check if a category code already exists for a user
     */
    boolean existsByUserIdAndCode(Long userId, String code);
    
    /**
     * Check if a category code exists for a user, excluding a specific category ID
     */
    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM SpendingCategory c " +
           "WHERE c.userId = :userId AND c.code = :code AND c.id != :excludeId")
    boolean existsByUserIdAndCodeExcludingId(@Param("userId") Long userId, 
                                             @Param("code") String code, 
                                             @Param("excludeId") String excludeId);
    
    /**
     * Find all default categories (for seeding new users)
     */
    List<SpendingCategory> findByIsDefaultAndIsActive(Boolean isDefault, Boolean isActive);
    
    /**
     * Count categories for a user
     */
    long countByUserIdAndIsActive(Long userId, Boolean isActive);
}
