package com.example.auth.filter;

import com.example.auth.consts.PermitPath;
import com.example.auth.services.AuthService;
import com.example.auth.utils.JWTUtils;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Autowired
    private JWTUtils jwtUtils;

    @Autowired
    UserDetailsService userDetailsService;

    @Autowired
    AuthService authService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Token không hợp lệ");
            return;

        }
        String jwt = authHeader.substring(7);
        String username = jwtUtils.extractUsername(jwt);

        if (username.isEmpty() || jwtUtils.isTokenExpired(jwt)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Token expired");
            return;
        }

        if (!authService.checkUserExist(username)) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Token không hợp lệ, User khong ton tai");
            return;
        }

        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            List<String> roles = jwtUtils.extractRoles(jwt);

            List<GrantedAuthority> authorities = roles.stream()
                    .map(SimpleGrantedAuthority::new)
                    .collect(Collectors.toList());

            UsernamePasswordAuthenticationToken authToken =
                    new UsernamePasswordAuthenticationToken(username, null, authorities);

            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authToken);
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getServletPath();

        for (String pattern : PermitPath.PUBLIC_URLS) {
            if (pathMatcher.match(pattern, path)) {
                return true;
            }
        }
        return false;
    }
}
