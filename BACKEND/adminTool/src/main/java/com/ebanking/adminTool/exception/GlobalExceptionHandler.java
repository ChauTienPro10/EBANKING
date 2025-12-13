package com.ebanking.admintool.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Global Exception Handler for Admin Tool
 * Provides consistent error responses across all endpoints
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

        /**
         * Handle validation errors
         * Override method from ResponseEntityExceptionHandler to avoid conflict
         */
        @Override
        protected ResponseEntity<Object> handleMethodArgumentNotValid(
                        MethodArgumentNotValidException ex,
                        HttpHeaders headers,
                        HttpStatusCode status,
                        WebRequest request) {

                BindingResult bindingResult = ex.getBindingResult();
                List<String> errors = new ArrayList<>();

                bindingResult.getFieldErrors()
                                .forEach(error -> errors.add(error.getField() + ": " + error.getDefaultMessage()));

                bindingResult.getGlobalErrors()
                                .forEach(error -> errors.add(error.getObjectName() + ": " + error.getDefaultMessage()));

                log.warn("Validation error: {}", errors);

                ErrorResponse errorResponse = ErrorResponse.builder()
                                .requestId(UUID.randomUUID().toString())
                                .error("VALIDATION_ERROR")
                                .message("Input validation failed")
                                .status(HttpStatus.BAD_REQUEST.value())
                                .timestamp(LocalDateTime.now())
                                .path(getPath(request))
                                .details(errors)
                                .build();

                return new ResponseEntity<>(errorResponse, headers, HttpStatus.BAD_REQUEST);
        }

        /**
         * Handle authentication errors
         */
        @ExceptionHandler({ AuthenticationException.class, BadCredentialsException.class })
        public ResponseEntity<ErrorResponse> handleAuthenticationException(
                        Exception ex, WebRequest request) {

                log.warn("Authentication error: {}", ex.getMessage());

                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(ErrorResponse.builder()
                                                .requestId(UUID.randomUUID().toString())
                                                .error("AUTHENTICATION_ERROR")
                                                .message("Invalid credentials or authentication failed")
                                                .status(HttpStatus.UNAUTHORIZED.value())
                                                .timestamp(LocalDateTime.now())
                                                .path(getPath(request))
                                                .build());
        }

        /**
         * Handle resource not found errors
         */
        @ExceptionHandler(ResourceNotFoundException.class)
        public ResponseEntity<ErrorResponse> handleResourceNotFoundException(
                        ResourceNotFoundException ex, WebRequest request) {

                log.warn("Resource not found: {}", ex.getMessage());

                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(ErrorResponse.builder()
                                                .requestId(UUID.randomUUID().toString())
                                                .error("RESOURCE_NOT_FOUND")
                                                .message(ex.getMessage())
                                                .status(HttpStatus.NOT_FOUND.value())
                                                .timestamp(LocalDateTime.now())
                                                .path(getPath(request))
                                                .build());
        }

        /**
         * Handle business logic errors
         */
        @ExceptionHandler(BusinessException.class)
        public ResponseEntity<ErrorResponse> handleBusinessException(
                        BusinessException ex, WebRequest request) {

                log.warn("Business error: {}", ex.getMessage());

                return ResponseEntity.status(ex.getStatus())
                                .body(ErrorResponse.builder()
                                                .requestId(UUID.randomUUID().toString())
                                                .error(ex.getErrorCode())
                                                .message(ex.getMessage())
                                                .status(ex.getStatus().value())
                                                .timestamp(LocalDateTime.now())
                                                .path(getPath(request))
                                                .build());
        }

        /**
         * Handle illegal argument errors
         */
        @ExceptionHandler(IllegalArgumentException.class)
        public ResponseEntity<ErrorResponse> handleIllegalArgumentException(
                        IllegalArgumentException ex, WebRequest request) {

                log.warn("Illegal argument: {}", ex.getMessage());

                return ResponseEntity.badRequest()
                                .body(ErrorResponse.builder()
                                                .requestId(UUID.randomUUID().toString())
                                                .error("INVALID_ARGUMENT")
                                                .message(ex.getMessage())
                                                .status(HttpStatus.BAD_REQUEST.value())
                                                .timestamp(LocalDateTime.now())
                                                .path(getPath(request))
                                                .build());
        }

        /**
         * Handle all other exceptions
         */
        @ExceptionHandler(Exception.class)
        public ResponseEntity<ErrorResponse> handleGenericException(
                        Exception ex, WebRequest request) {

                String requestId = UUID.randomUUID().toString();
                log.error("Unexpected error [RequestID: {}]: ", requestId, ex);

                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ErrorResponse.builder()
                                                .requestId(requestId)
                                                .error("INTERNAL_SERVER_ERROR")
                                                .message("An unexpected error occurred. Please contact support with Request ID: "
                                                                + requestId)
                                                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                                                .timestamp(LocalDateTime.now())
                                                .path(getPath(request))
                                                .build());
        }

        /**
         * Extract path from request
         */
        private String getPath(WebRequest request) {
                String description = request.getDescription(false);
                return description.replace("uri=", "");
        }
}
