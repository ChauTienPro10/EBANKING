package com.banking.userService.service;

import com.banking.userService.dto.OtpRegister;
import com.banking.userService.dto.response.UserResponse;
import com.banking.userService.entity.Role;
import com.banking.userService.entity.User;
import com.banking.userService.entity.UserInfo;
import com.banking.userService.enums.KafkaTopic;
import com.banking.userService.enums.UserRole;
import com.banking.userService.enums.VerifyType;
import com.banking.userService.grpc.UserProto;
import com.banking.userService.mapper.UserMapper;
import com.banking.userService.repository.IRoleRepository;
import com.banking.userService.repository.IUserInfoRepository;
import com.banking.userService.repository.IUserRepository;
import com.banking.userService.utils.JwtTokenProvider;
import com.banking.userService.utils.OtpUtils;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$";
    private static final Pattern EMAIL_PATTERN = Pattern.compile(EMAIL_REGEX);

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Autowired
    public UserService(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
    }

    @Autowired
    private IUserInfoRepository userInfoRepository;

    @Autowired
    private UserMapper userMapper;

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

    @Autowired
    private OtpUtils otpUtils;

    public Boolean genOTP(String username,
                          String pass,
                          String citizenId,
                          String typeVerify) {
        if (VerifyType.PHONE.getName().equals(typeVerify)) {
            return null;
        }
        if (emailNonValid(username)) throw new RuntimeException("Email is existed or not valid!");

        if (userInfoRepository.existsByCitizenId(citizenId)) throw new RuntimeException("Citizen ID is existed!");

        OtpRegister otpRegister = OtpRegister.builder()
                .username(username)
                .citizenId(citizenId)
                .pass(pass)
                .typeVerify(typeVerify)
                .build();
        otpRegister = otpUtils.genOtp(username, otpRegister, 300);
        kafkaTemplate.send(KafkaTopic.SEND_OTP.getTopicName(), otpRegister);
        return true;
    }

    public UserResponse registerVerifyOtp(String username,
                                   String otpValue) {

        OtpRegister otpRegister = otpUtils.verifyOtpRegister(username, otpValue);

        User newUser = new User();
        Set<Role> defaultRoles = new HashSet<>();
        defaultRoles.add(roleRepository.findByName(UserRole.USER.getRoleName()));
        newUser.setRoles(defaultRoles);
        newUser.setUsername(username);
        newUser.setPassword(passwordEncoder.encode(otpRegister.getPass()));
        newUser.setCreateAt(new Date().getTime());
        newUser.setUserInfo(null);
        userRepository.save(newUser);

        UserInfo userInfo = new UserInfo();
        userInfo.setEmail(username);
        userInfo.setCitizenId(otpRegister.getCitizenId());
        userInfo.setUser(newUser);
        userInfo.setCreateAt(new Date().getTime());
        userInfoRepository.save(userInfo);

        newUser.setUserInfo(userInfo);
        userRepository.save(newUser);

        kafkaTemplate.send(KafkaTopic.SEND_EMAIL.getTopicName(), username);

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
            Optional<UserInfo> userInfo = userInfoRepository.findById(user.getUserInfo().getId());
            Set<String> roleNames = user.getRoles().stream()
                    .map(Role::getName)
                    .collect(Collectors.toSet());
            UserProto.User userProto = userMapper.toUserProto(userInfo.get());
            return UserProto.LoginResponse.newBuilder()
                    .setJwt(token)
                    .setUser(userProto)
                    .build();
        } catch (BadCredentialsException e) {
            throw  new RuntimeException(e);
        }
    }

    public UserProto.CheckUserExistResponse checkUserExist(UserProto.CheckUserExistRequest request) {
        boolean rs = userRepository.existsByUsername(request.getUsername());
        return UserProto.CheckUserExistResponse.newBuilder()
                .setIsExist(rs)
                .build();
    }

    public UserProto.UserResponse getUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found with id: " + userId));

        return userMapper.UsertoProtoUserResponse(user);
    }

}
