package com.ebanking.transactionService.enums;

public enum KafkaTopic {
    TRANSACTION("transaction"),
    TRANSACTION_NOTIFY("transaction-notify"),
    TRANSACTION_PROCESSER("transaction-processer"),
    TRANSFER_SEND_EMAIL("transfer-send-email"),
    TRANSFER_NOTIFY_REALTIME("notify_transaction_socket")
    ;

    private final String topicName;

    public static final String TRANSACTION_TOPIC = "transaction-processer";

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
