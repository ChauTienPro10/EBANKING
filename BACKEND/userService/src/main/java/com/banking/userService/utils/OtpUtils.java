package com.banking.userService.utils;

import com.banking.userService.dto.OtpRegister;
import org.apache.tomcat.websocket.AuthenticationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.stereotype.Component;

import java.util.Random;
import java.util.concurrent.TimeUnit;

@Component
public class OtpUtils {
    @Autowired
    private RedisTemplate<String, OtpRegister> redisTemplateOtpRegister;

    @Autowired
    private RedisTemplate<String, String> redisTemplateForString;


    private OtpRegister genOtp(OtpRegister otpRegister) {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        otpRegister.setOtpValue(100000);
        return otpRegister;
    }

    public String genOtp(String username, long expireTime) {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        redisTemplateForString.opsForValue().set("otp-string:" + username, String.valueOf(otp), expireTime, TimeUnit.SECONDS);
        return String.valueOf(otp);
    }

    public OtpRegister genOtp(String username, OtpRegister otpRegister, long expireTime) {
        String key = "otp:" + username;
        redisTemplateOtpRegister.opsForValue().set(key, genOtp(otpRegister), expireTime, TimeUnit.SECONDS);
        return otpRegister;
    }

    public OtpRegister verifyOtpRegister(String username, String otpValue) throws BadCredentialsException {
        String key = "otp:" + username;
        OtpRegister otpRegister = redisTemplateOtpRegister.opsForValue().get(key);

        if (otpRegister == null || otpValue == null) {
            throw new BadCredentialsException("Xác thực OTP thất bại");
        }

        if (otpValue.equals(String.valueOf(otpRegister.getOtpValue()))) {
            redisTemplateOtpRegister.delete(key);
            return otpRegister;
        }

        throw new BadCredentialsException("Xác thực OTP thất bại");
    }

    public boolean verifyOtpForgotPassword(String username, String otp) {
        String key = "otp-string:" + username;
        String otpInRedis = redisTemplateForString.opsForValue().get(key);
        if (otpInRedis == null) return false;
        return otpInRedis.equals(otp);
    }

}
