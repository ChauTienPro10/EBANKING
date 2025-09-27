package com.example.auth.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class SecurityUtils {

    @Autowired
    private JWTUtils jwtUtils;

    public boolean checkUser(Map<String, String> headers, String _username) {
        String authHeader = headers.get("authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }

        String jwt = authHeader.substring(7);
        String username = jwtUtils.extractUsername(jwt);

        return username.equals(_username);
    }
}
