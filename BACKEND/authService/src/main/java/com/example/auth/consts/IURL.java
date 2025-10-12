package com.example.auth.consts;

public interface IURL {
    String HOST_PREFIX = "/authService";
    String AUTH_URL = HOST_PREFIX + "/auth";
    String REGISTER_URL = "/register";
    String REGISTER_VERIFY_OTP_URL = "/register-verify-otp";
    String LOGIN_URL = "/login";
    String UPDATE_URL = "/update";
    String CHANGE_PASSWORD_URL = "/change-password";

    String ACCOUNT_TRANS = HOST_PREFIX + "/trans/account";
    String OPEN_ACC_TRANS = "/new";
    String TRANSACTION = HOST_PREFIX + "/transaction";
    String TRANSFER = "/transfer";
    String TRANS_HISTOTY = "/history";
}