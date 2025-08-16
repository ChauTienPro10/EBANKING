package com.example.demo.services;

import com.example.demo.dto.req.CreateUserRequest;
import com.example.demo.entity.User;

public interface IUserService {
    public User createUser(CreateUserRequest data);

    boolean emailExists(String email);
}
