package com.banking.userService.service;

import com.banking.userService.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.stream.Collectors;

public class CustomUserDetails implements UserDetails {

    User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName()))
                .collect(Collectors.toSet());
    }


    @Override
    public String getPassword() {
        return this.user.getPassword();
    }

    @Override
    public String getUsername() {
        return this.user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;  // tùy chỉnh nếu cần
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;  // tùy chỉnh nếu cần
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;  // tùy chỉnh nếu cần
    }

    @Override
    public boolean isEnabled() {
        return true;  // tùy chỉnh nếu cần
    }
}
