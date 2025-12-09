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

    /**
     * Extract userId from JWT token in Authorization header
     * Used for eKYC integration to identify authenticated user
     */
    public Long extractUserIdFromHeaders(Map<String, String> headers) {
        String authHeader = headers.get("authorization");
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new SecurityException("Missing or invalid Authorization header");
        }

        String jwt = authHeader.substring(7);
        return jwtUtils.extractUserId(jwt);
    }

    /**
     * Validate that the requesting user matches the userId in request
     * Used for eKYC to ensure users can only access their own data
     */
    public boolean validateUserAccess(Map<String, String> headers, Long requestedUserId) {
        Long authenticatedUserId = extractUserIdFromHeaders(headers);
        return authenticatedUserId.equals(requestedUserId);
    }
}
