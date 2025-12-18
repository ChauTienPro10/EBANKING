package com.ebanking.adminTool.validator;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Password Validator
 * Enforces strong password requirements
 */
@Component
@Slf4j
public class PasswordValidator {
    
    // Password must contain: uppercase, lowercase, digit, special character
    // Minimum 12 characters
    private static final Pattern STRONG_PASSWORD = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{12,}$"
    );
    
    private static final int MIN_LENGTH = 12;
    private static final int MAX_LENGTH = 128;
    
    /**
     * Validate password strength
     * @param password Password to validate
     * @throws IllegalArgumentException if password doesn't meet requirements
     */
    public void validate(String password) {
        if (password == null || password.isBlank()) {
            throw new IllegalArgumentException("Password cannot be empty");
        }
        
        if (password.length() < MIN_LENGTH) {
            throw new IllegalArgumentException(
                    String.format("Password must be at least %d characters long", MIN_LENGTH)
            );
        }
        
        if (password.length() > MAX_LENGTH) {
            throw new IllegalArgumentException(
                    String.format("Password must not exceed %d characters", MAX_LENGTH)
            );
        }
        
        if (!STRONG_PASSWORD.matcher(password).matches()) {
            throw new IllegalArgumentException(
                    "Password must contain uppercase letter, lowercase letter, digit, and special character (@$!%*?&)"
            );
        }
        
        log.debug("Password validation passed");
    }
    
    /**
     * Check if password is strong
     * @param password Password to check
     * @return true if password is strong, false otherwise
     */
    public boolean isStrong(String password) {
        try {
            validate(password);
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}

