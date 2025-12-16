package com.example.auth.services;

import com.example.auth.dto.LockAccountRequest;
import com.example.auth.dto.LockAccountResponse;
import com.example.auth.dto.UnlockAccountRequest;
import com.example.auth.entity.LockAccount;
import com.example.auth.repository.LockAccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class LockAccountService {
    @Autowired
    LockAccountRepository lockAccountRepository;

    @Autowired
    AuthService authService;

    /**
     * Khóa tài khoản
     * 
     * @param request Thông tin khóa tài khoản
     * @return Response với thông tin tài khoản đã khóa
     * @throws IllegalStateException nếu tài khoản đã bị khóa
     */
    @Transactional
    public LockAccountResponse lockAccount(LockAccountRequest request) {
        // Kiểm tra xem tài khoản đã bị khóa chưa
        if (isAccountLocked(request.getUsername())) {
            throw new IllegalStateException("Tài khoản '" + request.getUsername() + "' đã bị khóa trước đó");
        }

        // Tạo bản ghi khóa mới
        LockAccount lockAccount = LockAccount.builder()
                .username(request.getUsername())
                .userId(request.getUserId())
                .accountId(request.getAccountId())
                .reason(request.getReason())
                .lockType("ADMIN_LOCK")
                .lockedAt(LocalDateTime.now())
                .lockedBy(request.getLockedBy())
                .isActive(true)
                .notes(request.getNotes())
                .build();

        LockAccount saved = lockAccountRepository.save(lockAccount);
        return LockAccountResponse.fromEntity(saved, "Tài khoản đã được khóa thành công");
    }

    /**
     * Mở khóa tài khoản
     * 
     * @param request Thông tin mở khóa
     * @return Response với thông tin tài khoản đã mở khóa
     * @throws IllegalStateException nếu tài khoản không bị khóa
     */
    @Transactional
    public LockAccountResponse unlockAccount(UnlockAccountRequest request) {
        // Tìm bản ghi khóa đang hoạt động
        Optional<LockAccount> lockAccountOpt = lockAccountRepository
                .findByUsernameAndIsActiveTrue(request.getUsername());

        if (lockAccountOpt.isEmpty()) {
            throw new IllegalStateException("Tài khoản '" + request.getUsername() + "' không bị khóa");
        }

        LockAccount lockAccount = lockAccountOpt.get();
        lockAccount.setIsActive(false);
        lockAccount.setUnlockedAt(LocalDateTime.now());
        lockAccount.setUnlockedBy(request.getUnlockedBy());

        // Cập nhật notes nếu có
        if (request.getNotes() != null && !request.getNotes().isEmpty()) {
            String currentNotes = lockAccount.getNotes() != null ? lockAccount.getNotes() : "";
            lockAccount.setNotes(currentNotes + "\n[Mở khóa] " + request.getNotes());
        }

        LockAccount saved = lockAccountRepository.save(lockAccount);
        return LockAccountResponse.fromEntity(saved, "Tài khoản đã được mở khóa thành công");
    }

    /**
     * Kiểm tra xem tài khoản có đang bị khóa không
     * 
     * @param username Tên đăng nhập
     * @return true nếu đang bị khóa, false nếu không
     */
    public boolean isAccountLocked(String username) {
        return lockAccountRepository.existsByUsernameAndIsActiveTrue(username);
    }

    /**
     * Lấy thông tin khóa hiện tại của tài khoản
     * 
     * @param username Tên đăng nhập
     * @return Optional chứa thông tin khóa nếu đang bị khóa
     */
    public Optional<LockAccountResponse> getCurrentLockInfo(String username) {
        return lockAccountRepository.findByUsernameAndIsActiveTrue(username)
                .map(lock -> LockAccountResponse.fromEntity(lock, "Tài khoản đang bị khóa"));
    }

    /**
     * Lấy lịch sử khóa của một tài khoản
     * 
     * @param username Tên đăng nhập
     * @return Danh sách lịch sử khóa
     */
    public List<LockAccount> getLockHistory(String username) {
        return lockAccountRepository.findByUsernameOrderByLockedAtDesc(username);
    }

    /**
     * Lấy lịch sử khóa của một tài khoản (có phân trang)
     * 
     * @param username Tên đăng nhập
     * @param page     Số trang
     * @param size     Số lượng mỗi trang
     * @return Page chứa lịch sử khóa
     */
    public Page<LockAccount> getLockHistory(String username, int page, int size) {
        return lockAccountRepository.findByUsernameOrderByLockedAtDesc(username, PageRequest.of(page, size));
    }

    /**
     * Lấy tất cả tài khoản đang bị khóa
     * 
     * @return Danh sách tài khoản đang bị khóa
     */
    public List<LockAccount> getAllLockedAccounts() {
        return lockAccountRepository.findByIsActiveTrueOrderByLockedAtDesc();
    }

    /**
     * Lấy tất cả tài khoản đang bị khóa (có phân trang)
     * 
     * @param page Số trang
     * @param size Số lượng mỗi trang
     * @return Page chứa tài khoản đang bị khóa
     */
    public Page<LockAccount> getAllLockedAccounts(int page, int size) {
        return lockAccountRepository.findByIsActiveTrueOrderByLockedAtDesc(PageRequest.of(page, size));
    }

    /**
     * Đếm số lượng tài khoản đang bị khóa
     * 
     * @return Số lượng tài khoản đang bị khóa
     */
    public long getLockedAccountsCount() {
        return lockAccountRepository.countByIsActiveTrue();
    }

    /**
     * Lấy danh sách tài khoản bị khóa bởi một admin
     * 
     * @param adminUsername Username của admin
     * @return Danh sách tài khoản đã bị khóa bởi admin này
     */
    public List<LockAccount> getAccountsLockedBy(String adminUsername) {
        return lockAccountRepository.findByLockedByOrderByLockedAtDesc(adminUsername);
    }

    // ========== PHƯƠNG THỨC TỰ KHÓA/MỞ TÀI KHOẢN ==========

    /**
     * Người dùng tự khóa tài khoản của mình
     * 
     * @param username Tên đăng nhập
     * @param reason   Lý do tự khóa
     * @param notes    Ghi chú
     * @return Response với thông tin tài khoản đã khóa
     * @throws IllegalStateException nếu tài khoản đã bị khóa
     */
    @Transactional
    public LockAccountResponse selfLockAccount(String username, String reason, String notes) {
        // Kiểm tra xem tài khoản đã bị khóa chưa
        if (isAccountLocked(username)) {
            throw new IllegalStateException("Tài khoản '" + username + "' đã bị khóa trước đó");
        }

        // Tạo bản ghi tự khóa
        LockAccount lockAccount = LockAccount.builder()
                .username(username)
                .reason(reason != null ? reason : "Người dùng tự khóa tài khoản")
                .lockType("SELF_LOCK")
                .lockedAt(LocalDateTime.now())
                .lockedBy(username) // Tự khóa nên lockedBy = username
                .isActive(true)
                .notes(notes)
                .build();

        LockAccount saved = lockAccountRepository.save(lockAccount);
        return LockAccountResponse.fromEntity(saved,
                "Bạn đã tự khóa tài khoản thành công. Vui lòng liên hệ hỗ trợ hoặc sử dụng mã xác thực để mở khóa.");
    }

    /**
     * Người dùng tự mở khóa tài khoản (chỉ áp dụng cho SELF_LOCK)
     * 
     * @param username Tên đăng nhập
     * @param password Mật khẩu để xác thực
     * @param notes    Ghi chú
     * @return Response với thông tin tài khoản đã mở khóa
     * @throws IllegalStateException nếu không thể tự mở khóa
     */
    @Transactional
    public LockAccountResponse selfUnlockAccount(String username, String password, String notes) {
        // Tìm bản ghi khóa đang hoạt động
        Optional<LockAccount> lockAccountOpt = lockAccountRepository
                .findByUsernameAndIsActiveTrue(username);

        if (lockAccountOpt.isEmpty()) {
            throw new IllegalStateException("Tài khoản '" + username + "' không bị khóa");
        }

        LockAccount lockAccount = lockAccountOpt.get();

        // Kiểm tra xem có phải SELF_LOCK không
        if (!"SELF_LOCK".equals(lockAccount.getLockType())) {
            throw new IllegalStateException(
                    "Tài khoản bị khóa bởi quản trị viên. Vui lòng liên hệ hỗ trợ để mở khóa.");
        }

        // Xác thực mật khẩu
        if (password == null || password.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng cung cấp mật khẩu");
        }

        // Gọi AuthService để xác thực mật khẩu
        boolean isPasswordValid = authService.verifyPassword(username, password);
        if (!isPasswordValid) {
            throw new IllegalArgumentException("Mật khẩu không đúng");
        }

        // Mở khóa tài khoản
        lockAccount.setIsActive(false);
        lockAccount.setUnlockedAt(LocalDateTime.now());
        lockAccount.setUnlockedBy(username); // Tự mở khóa

        if (notes != null && !notes.isEmpty()) {
            String currentNotes = lockAccount.getNotes() != null ? lockAccount.getNotes() : "";
            lockAccount.setNotes(currentNotes + "\n[Tự mở khóa] " + notes);
        }

        LockAccount saved = lockAccountRepository.save(lockAccount);
        return LockAccountResponse.fromEntity(saved, "Bạn đã tự mở khóa tài khoản thành công");
    }

    /**
     * Kiểm tra xem người dùng có thể tự mở khóa không
     * 
     * @param username Tên đăng nhập
     * @return true nếu có thể tự mở khóa (SELF_LOCK), false nếu không
     */
    public boolean canSelfUnlock(String username) {
        Optional<LockAccount> lockAccountOpt = lockAccountRepository
                .findByUsernameAndIsActiveTrue(username);

        if (lockAccountOpt.isEmpty()) {
            return false;
        }

        return "SELF_LOCK".equals(lockAccountOpt.get().getLockType());
    }

    /**
     * Lấy loại khóa hiện tại của tài khoản
     * 
     * @param username Tên đăng nhập
     * @return Loại khóa (ADMIN_LOCK, SELF_LOCK) hoặc null nếu không bị khóa
     */
    public String getLockType(String username) {
        return lockAccountRepository.findByUsernameAndIsActiveTrue(username)
                .map(LockAccount::getLockType)
                .orElse(null);
    }
}
