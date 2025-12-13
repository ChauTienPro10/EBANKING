package com.ebanking.admintool.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception for business logic errors
 */
public class BusinessException extends RuntimeException {
    
    private final String errorCode;
    private final HttpStatus status;
    
    public BusinessException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
        this.status = HttpStatus.BAD_REQUEST;
    }
    
    public BusinessException(String errorCode, String message, HttpStatus status) {
        super(message);
        this.errorCode = errorCode;
        this.status = status;
    }
    
    public BusinessException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.status = HttpStatus.BAD_REQUEST;
    }
    
    public BusinessException(String errorCode, String message, HttpStatus status, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.status = status;
    }
    
    public String getErrorCode() {
        return errorCode;
    }
    
    public HttpStatus getStatus() {
        return status;
    }
}

