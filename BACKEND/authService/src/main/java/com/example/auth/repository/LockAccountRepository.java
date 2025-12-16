package com.example.auth.repository;

import com.example.auth.entity.LockAccount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LockAccountRepository extends JpaRepository<LockAccount, Long> {

    /**
     * Tìm bản ghi khóa đang hoạt động của một username
     */
    Optional<LockAccount> findByUsernameAndIsActiveTrue(String username);

    /**
     * Kiểm tra xem username có đang bị khóa không
     */
    boolean existsByUsernameAndIsActiveTrue(String username);

    /**
     * Lấy tất cả các tài khoản đang bị khóa
     */
    List<LockAccount> findByIsActiveTrueOrderByLockedAtDesc();

    /**
     * Lấy tất cả các tài khoản đang bị khóa (có phân trang)
     */
    Page<LockAccount> findByIsActiveTrueOrderByLockedAtDesc(Pageable pageable);

    /**
     * Lấy lịch sử khóa của một username (bao gồm cả đã mở khóa)
     */
    List<LockAccount> findByUsernameOrderByLockedAtDesc(String username);

    /**
     * Lấy lịch sử khóa của một username (có phân trang)
     */
    Page<LockAccount> findByUsernameOrderByLockedAtDesc(String username, Pageable pageable);

    /**
     * Đếm số lượng tài khoản đang bị khóa
     */
    long countByIsActiveTrue();

    /**
     * Tìm các tài khoản bị khóa bởi một admin cụ thể
     */
    List<LockAccount> findByLockedByOrderByLockedAtDesc(String lockedBy);
}
