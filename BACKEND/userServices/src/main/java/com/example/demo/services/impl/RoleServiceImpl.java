package com.example.demo.services.impl;

import com.example.demo.repository.IRoleRepository;
import com.example.demo.services.IRoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class RoleServiceImpl implements IRoleService {
    @Autowired
    private IRoleRepository roleRepository;
}
