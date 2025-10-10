package com.ebanking.transactionService.enums;

public enum KafkaTopic {
    TRANSACTION("transaction"),
    TRANSACTION_NOTIFY("transaction_notify"),
    TRANSACTION_PROCESSER("transaction_processer"),
    TRANSFER_SEND_EMAIL("transfer-send-email")
    ;

    private final String topicName;

    public static final String TRANSACTION_TOPIC = "transaction_processer";

    KafkaTopic(String topicName) {
        this.topicName = topicName;
    }

    public String getTopicName() {
        return topicName;
    }

    public static KafkaTopic fromName(String name) {
        for (KafkaTopic topic : KafkaTopic.values()) {
            if (topic.topicName.equalsIgnoreCase(name)) {
                return topic;
            }
        }
        throw new IllegalArgumentException("No KafkaTopic with name: " + name);
    }
}
