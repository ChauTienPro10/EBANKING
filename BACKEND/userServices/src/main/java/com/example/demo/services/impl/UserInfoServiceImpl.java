package com.example.demo.services.impl;

import com.example.demo.repository.IUserInfoRepository;
import com.example.demo.services.IUserInfoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserInfoServiceImpl implements IUserInfoService {
    @Autowired
    private IUserInfoRepository userInfoRepository;
}
