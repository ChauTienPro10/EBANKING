// java
package com.ebanking.adminTool.filter;

import com.ebanking.adminTool.utils.JWTUtils;
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
            "/admin/health",
            "/actuator/health",
            "/error");

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        // Use servlet path to avoid context-path mismatch
        String path = request.getServletPath();
        log.trace("JwtAuthenticationFilter.shouldNotFilter - servletPath={} requestURI={}", path, request.getRequestURI());

        // Accept both API and non-API auth/setup endpoints as public
        return path.startsWith("/api/admin/auth/") ||
               path.startsWith("/admin/auth/") ||
               path.startsWith("/api/admin/setup") ||
               path.startsWith("/admin/setup") ||
               PUBLIC_PATHS.contains(path);
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String path = request.getServletPath();
        String method = request.getMethod();

        // Extra safety check (though shouldNotFilter covers it)
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
                        log.debug("[AUTHENTICATED] {} {} - User: {}", method, path, username);
                    }
                }
            }
        } catch (Exception e) {
            log.error(" [TOKEN_ERROR] {} {} - {}.", method, path, e.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private boolean isPublicPath(String path) {
        return path.startsWith("/api/admin/auth/") ||
               path.startsWith("/admin/auth/") ||
               PUBLIC_PATHS.contains(path) ||
               path.matches("^/.*\\.(css|js|png|jpg|ico)$");
    }
}
