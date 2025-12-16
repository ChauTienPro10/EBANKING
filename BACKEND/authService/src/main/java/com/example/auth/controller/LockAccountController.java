package com.example.auth.controller;

import com.example.auth.dto.LockAccountRequest;
import com.example.auth.dto.LockAccountResponse;
import com.example.auth.dto.UnlockAccountRequest;
import com.example.auth.entity.LockAccount;
import com.example.auth.services.LockAccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/authService/lock-account")
public class LockAccountController {

    @Autowired
    LockAccountService lockAccountService;

    @Autowired
    com.example.auth.utils.SecurityUtils securityUtils;

    /**
     * Khóa tài khoản
     * POST /lock-account/lock
     */
    @PostMapping("/lock")
    public ResponseEntity<?> lockAccount(@RequestBody LockAccountRequest request) {
        try {
            LockAccountResponse response = lockAccountService.lockAccount(request);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi khi khóa tài khoản: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Mở khóa tài khoản
     * POST /lock-account/unlock
     */
    @PostMapping("/unlock")
    public ResponseEntity<?> unlockAccount(@RequestBody UnlockAccountRequest request) {
        try {
            LockAccountResponse response = lockAccountService.unlockAccount(request);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi khi mở khóa tài khoản: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Kiểm tra trạng thái khóa của tài khoản
     * GET /lock-account/check/{username}
     */
    @GetMapping("/check/{username}")
    public ResponseEntity<?> checkLockStatus(@PathVariable String username) {
        try {
            boolean isLocked = lockAccountService.isAccountLocked(username);
            Map<String, Object> response = new HashMap<>();
            response.put("username", username);
            response.put("isLocked", isLocked);

            if (isLocked) {
                lockAccountService.getCurrentLockInfo(username)
                        .ifPresent(info -> response.put("lockInfo", info));
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi khi kiểm tra trạng thái: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy thông tin khóa hiện tại của tài khoản
     * GET /lock-account/current/{username}
     */
    @GetMapping("/current/{username}")
    public ResponseEntity<?> getCurrentLockInfo(@PathVariable String username) {
        try {
            Optional<LockAccountResponse> lockInfo = lockAccountService.getCurrentLockInfo(username);
            if (lockInfo.isPresent()) {
                return ResponseEntity.ok(lockInfo.get());
            } else {
                Map<String, String> response = new HashMap<>();
                response.put("message", "Tài khoản không bị khóa");
                return ResponseEntity.ok(response);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi khi lấy thông tin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy lịch sử khóa của tài khoản
     * GET /lock-account/history/{username}?page=0&size=10
     */
    @GetMapping("/history/{username}")
    public ResponseEntity<?> getLockHistory(
            @PathVariable String username,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            if (size <= 0) {
                // Lấy tất cả nếu size <= 0
                List<LockAccount> history = lockAccountService.getLockHistory(username);
                return ResponseEntity.ok(history);
            } else {
                // Lấy có phân trang
                Page<LockAccount> history = lockAccountService.getLockHistory(username, page, size);
                return ResponseEntity.ok(history);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi khi lấy lịch sử: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy tất cả tài khoản đang bị khóa
     * GET /lock-account/locked?page=0&size=10
     */
    @GetMapping("/locked")
    public ResponseEntity<?> getAllLockedAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            if (size <= 0) {
                // Lấy tất cả nếu size <= 0
                List<LockAccount> lockedAccounts = lockAccountService.getAllLockedAccounts();
                return ResponseEntity.ok(lockedAccounts);
            } else {
                // Lấy có phân trang
                Page<LockAccount> lockedAccounts = lockAccountService.getAllLockedAccounts(page, size);
                return ResponseEntity.ok(lockedAccounts);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi khi lấy danh sách: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Đếm số lượng tài khoản đang bị khóa
     * GET /lock-account/count
     */
    @GetMapping("/count")
    public ResponseEntity<?> getLockedAccountsCount() {
        try {
            long count = lockAccountService.getLockedAccountsCount();
            Map<String, Long> response = new HashMap<>();
            response.put("count", count);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi khi đếm: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy danh sách tài khoản bị khóa bởi một admin
     * GET /lock-account/locked-by/{adminUsername}
     */
    @GetMapping("/locked-by/{adminUsername}")
    public ResponseEntity<?> getAccountsLockedBy(@PathVariable String adminUsername) {
        try {
            List<LockAccount> accounts = lockAccountService.getAccountsLockedBy(adminUsername);
            return ResponseEntity.ok(accounts);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi khi lấy danh sách: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ========== ENDPOINTS TỰ KHÓA/MỞ TÀI KHOẢN ==========

    /**
     * Người dùng tự khóa tài khoản của mình
     * POST /lock-account/self-lock
     */
    @PostMapping("/self-lock")
    public ResponseEntity<?> selfLockAccount(
            @RequestBody com.example.auth.dto.SelfLockAccountRequest request,
            @RequestHeader Map<String, String> headers) {
        try {
            // Kiểm tra quyền: User chỉ có thể khóa tài khoản của chính họ
            if (!securityUtils.checkUser(headers, request.getUsername())) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Bạn không có quyền khóa tài khoản này");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            LockAccountResponse response = lockAccountService.selfLockAccount(
                    request.getUsername(),
                    request.getReason(),
                    request.getNotes());
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi khi tự khóa tài khoản: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Người dùng tự mở khóa tài khoản (cần mật khẩu)
     * POST /lock-account/self-unlock
     * 
     * Lưu ý: Endpoint này KHÔNG yêu cầu JWT token vì tài khoản đã bị khóa
     * Bảo mật được đảm bảo bằng xác thực mật khẩu
     */
    @PostMapping("/self-unlock")
    public ResponseEntity<?> selfUnlockAccount(
            @RequestBody com.example.auth.dto.SelfUnlockAccountRequest request) {
        try {
            // Không kiểm tra JWT token vì tài khoản đã bị khóa, user không thể đăng nhập
            // Bảo mật được đảm bảo bằng xác thực mật khẩu

            LockAccountResponse response = lockAccountService.selfUnlockAccount(
                    request.getUsername(),
                    request.getPassword(),
                    request.getNotes());
            return ResponseEntity.ok(response);
        } catch (IllegalStateException | IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi khi tự mở khóa tài khoản: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Kiểm tra xem người dùng có thể tự mở khóa không
     * GET /lock-account/can-self-unlock/{username}
     */
    @GetMapping("/can-self-unlock/{username}")
    public ResponseEntity<?> canSelfUnlock(@PathVariable String username) {
        try {
            boolean canUnlock = lockAccountService.canSelfUnlock(username);
            String lockType = lockAccountService.getLockType(username);

            Map<String, Object> response = new HashMap<>();
            response.put("username", username);
            response.put("canSelfUnlock", canUnlock);
            response.put("lockType", lockType);

            if (!canUnlock && lockType != null) {
                response.put("message", "Tài khoản bị khóa bởi quản trị viên. Vui lòng liên hệ hỗ trợ.");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi khi kiểm tra: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Lấy loại khóa của tài khoản
     * GET /lock-account/lock-type/{username}
     */
    @GetMapping("/lock-type/{username}")
    public ResponseEntity<?> getLockType(@PathVariable String username) {
        try {
            String lockType = lockAccountService.getLockType(username);

            Map<String, Object> response = new HashMap<>();
            response.put("username", username);
            response.put("lockType", lockType);
            response.put("isLocked", lockType != null);

            if (lockType != null) {
                if ("SELF_LOCK".equals(lockType)) {
                    response.put("message", "Tài khoản tự khóa. Có thể tự mở khóa bằng mã xác thực.");
                } else if ("ADMIN_LOCK".equals(lockType)) {
                    response.put("message", "Tài khoản bị khóa bởi quản trị viên.");
                }
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Lỗi khi lấy thông tin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
