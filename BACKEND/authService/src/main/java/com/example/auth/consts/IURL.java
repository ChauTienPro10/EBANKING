package com.example.auth.consts;

public interface IURL {
    String HOST_PREFIX = "/authService";
    String CHAT_SERVICE = "/chatService";
    String AUTH_URL = HOST_PREFIX + "/auth";
    String REGISTER_URL = "/register";
    String REGISTER_VERIFY_OTP_URL = "/register-verify-otp";
    String LOGIN_URL = "/login";
    String UPDATE_URL = "/update";
    String CHANGE_PASSWORD_URL = "/change-password";
    String FORGOT_PASSWORD_REQUEST_OTP = "/forgot-password-send-otp";
    String FORGOT_PASSWORD_VERIFY_OTP = "/forgot-password-verify-otp";


    String ACCOUNT_TRANS = HOST_PREFIX + "/trans/account";
    String OPEN_ACC_TRANS = "/new";
    String TRANSACTION = HOST_PREFIX + "/transaction";
    String TRANSFER = "/transfer";
    String TRANS_HISTOTY = "/history";
    String GET_ACCOUNT_INFO = "/account/{userId}";

    String PIN_CODE_URL = HOST_PREFIX + "/pin-code";
    String NEW_PIN = "/new";
    String DELETE_PIN = "/delete";
    
    // eKYC URLs
    String EKYC_URL = HOST_PREFIX + "/ekyc";
}