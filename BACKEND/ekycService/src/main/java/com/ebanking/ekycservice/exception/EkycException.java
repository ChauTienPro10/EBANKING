package com.ebanking.ekycservice.exception;

import lombok.Getter;

@Getter
public class EkycException extends RuntimeException {
    private final String errorCode;

    public EkycException(String message) {
        super(message);
        this.errorCode = "EKYC_ERROR";
    }

    public EkycException(String errorCode, String message) {
        super(message);
        this.errorCode = errorCode;
    }

    public EkycException(String message, Throwable cause) {
        super(message, cause);
        this.errorCode = "EKYC_ERROR";
    }

    public EkycException(String errorCode, String message, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
    }
}

