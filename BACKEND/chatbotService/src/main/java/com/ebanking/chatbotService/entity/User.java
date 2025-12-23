package com.ebanking.chatbotService.entity;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Set;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class User {
    private Long id;
    private String username;
    private String password;
    private Long createAt;
    private Long updatedAt;
    private Set<Role> roles;
    private UserInfo userInfo;
}