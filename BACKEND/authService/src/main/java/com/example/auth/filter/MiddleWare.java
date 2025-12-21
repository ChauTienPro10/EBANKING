package com.example.auth.filter;

import com.example.auth.services.LockAccountService;
import com.example.auth.utils.JWTUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
@Order(2)
@Slf4j
public class MiddleWare extends OncePerRequestFilter {

    @Autowired
    private LockAccountService lockAccountService;

    @Autowired
    private JWTUtils jwtUtils;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        log.debug("Filter Middle ware executing for: {}", request.getRequestURI());
        
        // Check if this is a transaction-related endpoint
        if (isTransactionEndpoint(request)) {
            HttpServletRequest wrappedRequest = request;
            
            // Wrap request to cache body for POST requests
            if ("POST".equals(request.getMethod()) && hasJsonContent(request)) {
                wrappedRequest = new CachedBodyHttpServletRequest(request);
            }
            
            String username = extractUsernameFromRequest(wrappedRequest);
            
            if (username != null && !username.isEmpty()) {
                // Check if the account is locked
                if (lockAccountService.isAccountLocked(username)) {
                    log.warn("Blocked transaction attempt from locked account: {} on endpoint: {}", 
                            username, request.getRequestURI());
                    sendForbiddenResponse(response, username);
                    return;
                }
                log.debug("Account {} is not locked, allowing transaction", username);
            } else {
                log.debug("No username found in request, skipping lock check");
            }
            
            filterChain.doFilter(wrappedRequest, response);
        } else {
            filterChain.doFilter(request, response);
        }
    }

    /**
     * Check if the current request is for a transaction endpoint
     */
    private boolean isTransactionEndpoint(HttpServletRequest request) {
        String uri = request.getRequestURI();
        String method = request.getMethod();
        
        // Check for specific transaction endpoints from TransactionController
        boolean isTransferEndpoint = uri.contains("/transaction/transfer") && "POST".equals(method);
        boolean isHistoryEndpoint = uri.contains("/transaction/history") && "GET".equals(method);
        boolean isNewAccountEndpoint = uri.contains("/trans/account/new") && "POST".equals(method);
        
        // Check for new savings and transaction request endpoints
        boolean isSavingsTransferEndpoint = uri.contains("/savings-transfers") && "POST".equals(method);
        boolean isSavingsAccountEndpoint = uri.contains("/savings-accounts") && "POST".equals(method);
        boolean isTransactionRequestEndpoint = uri.contains("/transaction-requests") && "POST".equals(method);
        boolean isFaceAuthEndpoint = uri.contains("/check-face-auth") && "POST".equals(method);
        
        // Also check for any POST/PUT/PATCH on transaction paths
        boolean isTransactionPath = (uri.contains("/transaction") || 
                                   uri.contains("/trans/account") ||
                                   uri.contains("/savings-transfers") ||
                                   uri.contains("/savings-accounts") ||
                                   uri.contains("/transaction-requests")) &&
                                   ("POST".equals(method) || "PUT".equals(method) || "PATCH".equals(method));
        
        return isTransferEndpoint || isHistoryEndpoint || isNewAccountEndpoint || 
               isSavingsTransferEndpoint || isSavingsAccountEndpoint || 
               isTransactionRequestEndpoint || isFaceAuthEndpoint || isTransactionPath;
    }

    /**
     * Check if request has JSON content
     */
    private boolean hasJsonContent(HttpServletRequest request) {
        String contentType = request.getContentType();
        return contentType != null && contentType.contains("application/json");
    }

    /**
     * Extract username from request parameters, body, or JWT token
     */
    private String extractUsernameFromRequest(HttpServletRequest request) {
        // First try to get from query parameters (for GET requests like /history)
        String username = request.getParameter("username");
        if (username != null && !username.isEmpty()) {
            return username;
        }
        
        // Try to get from path variables or query params for history endpoint
        if (request.getRequestURI().contains("/history")) {
            username = request.getParameter("username");
            if (username != null && !username.isEmpty()) {
                return username;
            }
        }
        
        // For POST requests with JSON body, try to extract username from body
        if ("POST".equals(request.getMethod()) && request instanceof CachedBodyHttpServletRequest) {
            try {
                CachedBodyHttpServletRequest cachedRequest = (CachedBodyHttpServletRequest) request;
                String body = cachedRequest.getBody();
                
                if (body != null && !body.trim().isEmpty()) {
                    JsonNode jsonNode = objectMapper.readTree(body);
                    
                    // Check for username field in JSON (for transfer requests)
                    if (jsonNode.has("username")) {
                        return jsonNode.get("username").asText();
                    }
                    
                    // Check for sender field (in case of transfer requests)
                    if (jsonNode.has("sender")) {
                        return jsonNode.get("sender").asText();
                    }
                }
            } catch (Exception e) {
                log.warn("Failed to parse JSON body for username extraction: {}", e.getMessage());
            }
        }
        
        // If no username found in request body/params, try to extract from JWT token
        // This is useful for endpoints like /trans/account/new that use JWT authentication
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String jwt = authHeader.substring(7);
                username = jwtUtils.extractUsername(jwt);
                if (username != null && !username.isEmpty()) {
                    log.debug("Extracted username from JWT token: {}", username);
                    return username;
                }
            } catch (Exception e) {
                log.warn("Failed to extract username from JWT token: {}", e.getMessage());
            }
        }
        
        return null;
    }

    /**
     * Send 403 Forbidden response for locked accounts
     */
    private void sendForbiddenResponse(HttpServletResponse response, String username) throws IOException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "ACCOUNT_LOCKED");
        errorResponse.put("message", "Tài khoản của bạn đã bị khóa và không thể thực hiện giao dịch");
        errorResponse.put("username", username);
        errorResponse.put("timestamp", System.currentTimeMillis());
        errorResponse.put("status", 403);
        
        // Get lock information if available
        try {
            lockAccountService.getCurrentLockInfo(username)
                    .ifPresent(lockInfo -> {
                        errorResponse.put("lockReason", lockInfo.getReason());
                        errorResponse.put("lockType", lockInfo.getLockType());
                        errorResponse.put("lockedAt", lockInfo.getLockedAt());
                        errorResponse.put("lockedBy", lockInfo.getLockedBy());
                    });
        } catch (Exception e) {
            log.warn("Failed to get lock info for user {}: {}", username, e.getMessage());
        }
        
        String jsonResponse = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(jsonResponse);
        response.getWriter().flush();
    }
}
