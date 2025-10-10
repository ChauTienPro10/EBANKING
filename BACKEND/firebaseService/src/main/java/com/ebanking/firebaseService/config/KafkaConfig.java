//package com.ebanking.firebaseService.config;
//
//import com.ebanking.firebaseService.dto.TransactionEvent;
//import org.apache.kafka.clients.consumer.ConsumerConfig;
//import org.apache.kafka.common.serialization.StringDeserializer;
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.kafka.annotation.EnableKafka;
//import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
//import org.springframework.kafka.core.ConsumerFactory;
//import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
//import org.springframework.kafka.listener.ContainerProperties;
//import org.springframework.kafka.support.serializer.JsonDeserializer;
//
//import java.util.HashMap;
//import java.util.Map;
//
////kafka configuration with retry mechanism and error handling
//@EnableKafka
//@Configuration
//public class KafkaConfig {
//
//    @Value("${spring.kafka.bootstrap-servers}")
//    private String bootstrapServers;
//
//    @Bean
//    public ConsumerFactory<String, TransactionEvent> consumerFactory() {
//        Map<String, Object> config = new HashMap<>();
//        config.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
//        config.put(ConsumerConfig.GROUP_ID_CONFIG, "firebase-group");
//        config.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
//        config.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, JsonDeserializer.class);
//        config.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
//
//        // enable manual acknowledgment for better control
//        config.put(ConsumerConfig.ENABLE_AUTO_COMMIT_CONFIG, false);
//
//        // retry configuration
//        config.put(ConsumerConfig.MAX_POLL_RECORDS_CONFIG, 10);
//        config.put(ConsumerConfig.MAX_POLL_INTERVAL_MS_CONFIG, 300000); // 5 minutes
//
//        JsonDeserializer<TransactionEvent> deserializer = new JsonDeserializer<>(TransactionEvent.class);
//        deserializer.setRemoveTypeHeaders(false);
//        deserializer.addTrustedPackages("*");
//        deserializer.setUseTypeMapperForKey(false);
//
//        return new DefaultKafkaConsumerFactory<>(config, new StringDeserializer(), deserializer);
//    }
//
//    @Bean
//    public ConcurrentKafkaListenerContainerFactory<String, TransactionEvent> kafkaListenerContainerFactory() {
//        ConcurrentKafkaListenerContainerFactory<String, TransactionEvent> factory =
//            new ConcurrentKafkaListenerContainerFactory<>();
//        factory.setConsumerFactory(consumerFactory());
//
//
//        factory.getContainerProperties().setAckMode(ContainerProperties.AckMode.MANUAL);
//
//
//        factory.setConcurrency(3);
//
//
//        factory.setCommonErrorHandler(new org.springframework.kafka.listener.DefaultErrorHandler(
//            (record, exception) -> {
//
//                System.err.println("Error processing record: " + record + ", Error: " + exception.getMessage());
//            }
//        ));
//
//        return factory;
//    }
//}
//
