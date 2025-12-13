package com.ebanking.admintool.filter;

import com.ebanking.admintool.utils.JWTUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * JWT Authentication Filter for Admin Tool
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JWTUtils jwtUtils;

    private static final Set<String> PUBLIC_PATHS = Set.of(
            "/api/admin/health",
            "/actuator/health",
            "/error");

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();

        if (isPublicPath(path)) {
            log.trace("[PUBLIC] Bypassing JWT filter for {} {}", method, path);
            filterChain.doFilter(request, response);
            return;
        }

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.trace("[NO_TOKEN] No JWT found for {} {}. Proceeding chain.", method, path);
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);

        try {
            if (SecurityContextHolder.getContext().getAuthentication() == null) {
                String username = jwtUtils.extractUsername(jwt);
                if (username != null) {
                    // Create a UserDetails object to pass to validateToken
                    // In this context, we don't have the password, so it's left empty.
                    // The primary validation is the token's signature and expiration.
                    var userDetails = org.springframework.security.core.userdetails.User.builder()
                            .username(username)
                            .password("") // Password is not needed for JWT validation
                            .authorities(jwtUtils.extractRoles(jwt).stream().map(SimpleGrantedAuthority::new)
                                    .collect(Collectors.toList()))
                            .build();

                    if (jwtUtils.validateToken(jwt, userDetails)) {
                        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities());
                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                        log.debug("✅ [AUTHENTICATED] {} {} - User: {}", method, path, username);
                    }
                }
            }
        } catch (Exception e) {
            log.error("❌ [TOKEN_ERROR] {} {} - {}.", method, path, e.getMessage());
            // When a token error occurs, we clear the context and let the exception
            // handling deal with it.
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicPath(String path) {
        return path.startsWith("/api/admin/auth/") ||
                PUBLIC_PATHS.contains(path) ||
                path.matches("^/.*\\.(css|js|png|jpg|ico)$");
    }
}
