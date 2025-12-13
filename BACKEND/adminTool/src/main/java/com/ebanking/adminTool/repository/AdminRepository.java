package com.ebanking.admintool.repository;

import com.ebanking.admintool.entity.Admin;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {
        Optional<Admin> findByUsername(String username);

        boolean existsByUsername(String username);

        @Query("SELECT a FROM Admin a WHERE (:search IS NULL OR LOWER(a.username) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.fullName) LIKE LOWER(CONCAT('%', :search, '%'))) AND (:role IS NULL OR a.role = :role) AND (:active IS NULL OR a.active = :active)")
        Page<Admin> searchAdmins(@Param("search") String search, @Param("role") String role,
                        @Param("active") Boolean active, Pageable pageable);

        long countByActiveTrue();

}
