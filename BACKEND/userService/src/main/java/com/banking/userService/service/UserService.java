package com.banking.userService.service;

import com.banking.userService.dto.response.UserResponse;
import com.banking.userService.entity.Role;
import com.banking.userService.entity.User;
import com.banking.userService.entity.UserInfo;
import com.banking.userService.grpc.UserProto;
import com.banking.userService.repository.IRoleRepository;
import com.banking.userService.repository.IUserInfoRepository;
import com.banking.userService.repository.IUserRepository;
import com.banking.userService.utils.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
    private static final Pattern EMAIL_PATTERN = Pattern.compile(EMAIL_REGEX);

    @Autowired
    private IUserInfoRepository userInfoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private IRoleRepository roleRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    public UserResponse createUser(String username,
                                   String pass,
                                   String citizenId,
                                   String typeVerify) {
        if ("phone".equals(typeVerify)) {
            return null;
        }
        if (emailNonValid(username)) throw new RuntimeException("Email is existed or not valid!");

        if (userInfoRepository.existsByCitizenId(citizenId)) throw new RuntimeException("Citizen ID is existed!");

        User newUser = new User();
        Set<Role> defaultRoles = new HashSet<>();
        defaultRoles.add(roleRepository.findByName("ROLE_USER"));
        newUser.setRoles(defaultRoles);

        newUser.setPassword(passwordEncoder.encode(pass));
        newUser.setCreateAt(new Date().getTime());
        newUser.setUserInfo(null);

        UserInfo userInfo = new UserInfo();
        userInfo.setEmail(username);
        userInfo.setCitizenId(citizenId);
        userInfoRepository.save(userInfo);

        newUser.setUserInfo(userInfo);
        userRepository.save(newUser);

        return UserResponse.builder()
                .id(newUser.getId())
                .username(username)
                .roles(newUser.getRoles())
                .createAt(new Date(newUser.getCreateAt()))
                .citizenId(userInfo.getCitizenId())
                .build();
    }

    public boolean emailNonValid(String email) {
        if (email == null || !EMAIL_PATTERN.matcher(email).matches()) {
            return true;
        }
        return userRepository.existsByUsername(email);
    }

    public UserProto.LoginResponse login(UserProto.LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);

            String token = jwtTokenProvider.generateToken(authentication);

            User user = userRepository.findByUsername(loginRequest.getUsername());
            UserInfo userInfo = userInfoRepository.findByUser(user);

            Set<String> roleNames = user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toSet());
            UserProto.User userProto = UserProto.User.newBuilder()
                    .setUsername(loginRequest.getUsername())
                    .setCitizenId(userInfo.getCitizenId())
                    .addAllRoles(roleNames)
                    .build();

            UserProto.LoginResponse rs = UserProto.LoginResponse.newBuilder()
                    .setJwt(token)
                    .build();


        } catch (BadCredentialsException e) {
            throw  new RuntimeException(e);
        }
        return null;
    }

}
