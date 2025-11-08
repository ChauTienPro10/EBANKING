package com.example.auth.consts;

public class PermitPath {
    public static final String[] PUBLIC_URLS = {
            IURL.AUTH_URL + IURL.REGISTER_URL,
            IURL.AUTH_URL + IURL.REGISTER_VERIFY_OTP_URL,
            IURL.AUTH_URL + IURL.LOGIN_URL,
            IURL.AUTH_URL + IURL.FORGOT_PASSWORD_REQUEST_OTP,
            IURL.AUTH_URL + IURL.FORGOT_PASSWORD_VERIFY_OTP,
            IURL.HOST_PREFIX + "/fcm/save-token",
    };
}
