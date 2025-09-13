package com.banking.userService.enums;

public enum KafkaTopic {
    SEND_OTP("send-otp"),
    SEND_EMAIL("send-email"),
    ;

    private final String topicName;

    KafkaTopic(String topicName) {
        this.topicName = topicName;
    }

    public String getTopicName() {
        return topicName;
    }

    @Override
    public String toString() {
        return topicName;
    }
}
