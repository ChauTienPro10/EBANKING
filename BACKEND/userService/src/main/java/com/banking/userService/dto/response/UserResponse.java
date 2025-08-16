package com.banking.userService.dto.response;

import com.banking.userService.entity.Role;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;
import java.util.Set;

@Getter
@Setter
@Builder
public class UserResponse {
    Long id;
    String username;
    String citizenId;
    Set<Role> roles;
    Date createAt;
}
