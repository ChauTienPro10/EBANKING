package com.example.auth.services;

import com.example.auth.protopkg.UserProto;
import com.example.auth.utils.JWTUtils;
import org.apache.tomcat.websocket.AuthenticationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    @Autowired
    JWTUtils jwtUtils;

    @Autowired
    AuthService authService;

    public boolean checkValidUser (String jwt, Long userId) throws AuthenticationException {
        if(jwt.isEmpty() || userId == null) {
            throw new AuthenticationException("Thông tin không hợp lệ");
        }
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String usernameHolder = authentication.getName();
        String username = jwtUtils.extractUsername(jwt);
        UserProto.UserResponse userResponse = authService.getUserById(userId);
        if (userResponse == null || !userResponse.getUser().getUsername().equals(username) ||
        !username.equals(usernameHolder)) {
            throw new AuthenticationException("Thông tin không hợp lệ");
        }
        return true;
    }
}
