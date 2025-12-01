package com.banking.userService.controller;

import com.banking.userService.dto.response.InternalUserResponse;
import com.banking.userService.dto.response.UserResponse;
import com.banking.userService.entity.User;
import com.banking.userService.mapper.UserMapper;
import com.banking.userService.repository.IUserInfoRepository;
import com.banking.userService.repository.IUserRepository;
import com.banking.userService.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/user")
public class UserController {
    @Autowired
    IUserRepository userRepository;

    @Autowired
    UserMapper userMapper;

    @Autowired
    IUserInfoRepository userInfoRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<InternalUserResponse> getUserInfo(@PathVariable String userId) {
        Optional<User> us = userRepository.findById(Long.valueOf(userId));
        if (us.isEmpty()) {
            return null;
        }

        InternalUserResponse userResponse = InternalUserResponse
                .builder().username(us.get().getUsername())
                .fulName(us.get().getUserInfo().getFullName())
                .userId(us.get().getId())
                .build();
        return ResponseEntity.ok(userResponse);
    }

}