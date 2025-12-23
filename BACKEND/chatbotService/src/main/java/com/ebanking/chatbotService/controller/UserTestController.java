package com.ebanking.chatbotService.controller;

import com.ebanking.chatbotService.entity.User;
import com.ebanking.chatbotService.service.SavingAccountService;
import com.ebanking.chatbotService.service.TransactionService;
import com.ebanking.chatbotService.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller để test UserService trực tiếp
 */
@RestController
@RequestMapping("/api/user-test")
@RequiredArgsConstructor
public class UserTestController {

    private final UserService userService;
    @Autowired
    TransactionService transactionService;

    @Autowired
    SavingAccountService savingAccountService;

    /**
     * Test lấy userId từ username
     */
    @GetMapping("/user-id/{username}")
    public Long getUserId(@PathVariable String username) {
        return userService.getUserIdByUsername(username);
    }

    /**
     * Test lấy thông tin user cơ bản
     */
    @GetMapping("/user/{username}")
    public User getUser(@PathVariable String username) {
        return userService.getUserByUsername(username);
    }

    /**
     * Test lấy full thông tin user
     */
    @GetMapping("/full-user/{username}")
    public User getFullUser(@PathVariable String username) {
        return userService.getFullUserInfoByUsername(username);
    }

    /**
     * Test lấy thông tin hiển thị
     */
    @GetMapping("/display-info/{username}")
    public String getDisplayInfo(@PathVariable String username) {
        return userService.getUserDisplayInfo(username);
    }

    /**
     * Test kiểm tra user tồn tại
     */
    @GetMapping("/exists/{username}")
    public boolean userExists(@PathVariable String username) {
        return userService.isUserExists(username);
    }

    @GetMapping("/getAccount")
    public Object getTransaction() {
        return ResponseEntity.status(HttpStatus.OK).body(transactionService.getAccountsByUserId(252L));
    }
    @GetMapping("/getSavingsAccountsByUserId")
    public Object getSavingsAccountsByUserId() {
        return ResponseEntity.status(HttpStatus.OK).body(savingAccountService.getSavingsAccountsByUserId(252L));
    }

    @GetMapping("/getActiveInterestRates")
    public Object getActiveInterestRates() {
        return ResponseEntity.status(HttpStatus.OK).body(savingAccountService.getActiveInterestRates());
    }
}