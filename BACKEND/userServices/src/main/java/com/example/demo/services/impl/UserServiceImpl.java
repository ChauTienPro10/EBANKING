package com.example.demo.services.impl;

import com.example.demo.dto.req.CreateUserRequest;
import com.example.demo.entity.Role;
import com.example.demo.entity.User;
import com.example.demo.repository.IRoleRepository;
import com.example.demo.repository.IUserRepository;
import com.example.demo.services.IUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
public class UserServiceImpl implements IUserService {
    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private IRoleRepository roleRepository;

    @Override
    public User createUser(CreateUserRequest data) {
        if (userRepository.findByUsername(data.getEmail()).isPresent()) {
            throw new RuntimeException("Email đã tồn tại.");
        }

        Role role = roleRepository.findByName("USER")
                .orElseThrow(() -> new RuntimeException("Role USER không tồn tại"));

        Set<Role> roles = new HashSet<>();
        roles.add(role);

        User newUser = User.builder()
                .username(data.getEmail())
                .password(passwordEncoder.encode(data.getPassword()))
                .roles(roles)
                .build();

        return userRepository.save(newUser);
    }

    @Override
    public boolean emailExists (String email) {
        return userRepository.findByUsername(email).isPresent();
    }
}
