package com.ebanking.adminTool.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Standard Error Response DTO
 * Used for all error responses across the application
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    
    /**
     * Unique request ID for tracking
     */
    private String requestId;
    
    /**
     * Error code (e.g., VALIDATION_ERROR, AUTHENTICATION_ERROR)
     */
    private String error;
    
    /**
     * Human-readable error message
     */
    private String message;
    
    /**
     * HTTP status code
     */
    private Integer status;
    
    /**
     * Timestamp when error occurred
     */
    private LocalDateTime timestamp;
    
    /**
     * Request path that caused the error
     */
    private String path;
    
    /**
     * Detailed error information (for validation errors)
     */
    private List<String> details;
}

