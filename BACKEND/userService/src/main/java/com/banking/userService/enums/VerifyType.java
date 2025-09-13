package com.banking.userService.enums;

public enum VerifyType {
    EMAIL("email"),
    PHONE("phone"),
    ;

    private final String name;

    VerifyType(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}

