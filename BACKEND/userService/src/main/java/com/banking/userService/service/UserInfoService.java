package com.banking.userService.service;

import com.banking.userService.repository.IUserInfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserInfoService {
    @Autowired
    private IUserInfoRepository userInfoRepository;
}
