package com.ebanking.adminTool.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

/**
 * JWT Utility for Admin Tool
 * Handles token generation, validation, and extraction
 *
 * SECURITY: JWT secret is loaded from environment variable, not hardcoded
 */
@Component
@Slf4j
public class JWTUtils {

    // ✅ FIXED: Secret is now injected from environment variable
    @Value("${jwt.secret.key}")
    private String secret;

    @Value("${jwt.expiration.minutes:30}")
    private int expirationMinutes;

    private SecretKey key;

    @PostConstruct
    public void init() {
        // ✅ FIXED: Validate secret key configuration
        if (secret == null || secret.isBlank()) {
            String errorMsg = "JWT secret key is not configured! " +
                    "Please set 'jwt.secret.key' environment variable or in application properties. " +
                    "Minimum length: 256 characters";
            log.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }

        // ✅ FIXED: Validate secret length (minimum 256 characters for HS512)
        if (secret.length() < 256) {
            String errorMsg = String.format(
                    "JWT secret key is too short! Current length: %d, Required: 256 characters",
                    secret.length());
            log.error(errorMsg);
            throw new IllegalStateException(errorMsg);
        }

        try {
            this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
            log.info("✅ JWT Secret Key loaded successfully (length: {} characters)", secret.length());
        } catch (Exception e) {
            String errorMsg = "Failed to initialize JWT secret key: " + e.getMessage();
            log.error(errorMsg, e);
            throw new IllegalStateException(errorMsg, e);
        }
    }

    /**
     * Generate JWT token for authenticated admin user
     */
    public String generateToken(Authentication authentication) {
        log.debug("Generating JWT token for user: {}", authentication.getName());

        List<String> roles = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        long expirationMs = expirationMinutes * 60L * 1000L;
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(authentication.getName())
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    /**
     * Extract username from JWT token
     */
    public String extractUsername(String token) {
        log.debug("Extracting username from JWT token");
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * Extract roles from JWT token
     */
    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.get("roles", List.class);
    }

    /**
     * Validate JWT token
     */
    public boolean validateToken(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
        } catch (Exception e) {
            log.warn("Token validation failed: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if token is expired
     */
    public boolean isTokenExpired(String token) {
        try {
            final Date expiration = Jwts.parser()
                    .verifyWith(this.key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getExpiration();
            return expiration.before(new Date());
        } catch (Exception e) {
            log.warn("Failed to check token expiration: {}", e.getMessage());
            return true; // Treat as expired if we can't verify
        }
    }

    /**
     * Extract all claims from token
     */
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
