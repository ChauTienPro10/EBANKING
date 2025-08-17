package com.banking.userService.mapper;

import com.banking.userService.entity.Role;
import com.banking.userService.entity.User;
import com.banking.userService.entity.UserInfo;
import com.banking.userService.grpc.UserProto;
import com.banking.userService.repository.IUserRepository;
import com.banking.userService.utils.DateTimeUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class UserMapper {
    @Autowired
    IUserRepository userRepository;

    public UserProto.User toUserProto(UserInfo userInfo) {
        if (userInfo == null || userInfo.getUser() == null || userInfo.getUser().getId() == null) {
            throw new IllegalArgumentException("UserInfo or user ID must not be null");
        }

        Optional<User> userOpt = userRepository.findById(userInfo.getUser().getId());

        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("User not found with ID: " + userInfo.getUser().getId());
        }

        User user = userOpt.get();

        Set<String> roleNames = Optional.ofNullable(user.getRoles())
                .orElse(Collections.emptySet())
                .stream()
                .filter(Objects::nonNull)
                .map(Role::getName)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        return UserProto.User.newBuilder()
                .setId(Optional.ofNullable(userInfo.getId()).orElse(0L))
                .addAllRoles(roleNames)
                .setCreateAt(Optional.of(DateTimeUtils.toDateFormated(userInfo.getCreateAt())).orElse(""))
                .setUsername(Optional.ofNullable(user.getUsername()).orElse(""))
                .setAddress(Optional.ofNullable(userInfo.getAddress()).orElse(""))
                .setCitizenId(Optional.ofNullable(userInfo.getCitizenId()).orElse(""))
                .setBirthday(Optional.of(DateTimeUtils.toDateFormated(userInfo.getBirthday())).orElse(""))
                .setFullName(Optional.ofNullable(userInfo.getFullName()).orElse(""))
                .setIsMale(Optional.ofNullable(userInfo.getIsMale()).orElse(false))
                .build();
    }

}
