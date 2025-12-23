package com.ebanking.chatbotService.config;

import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.HashMap;
import java.util.Map;

@Configuration
@Slf4j
public class ExternalDbConfig {

    @Bean
    public Map<String, JdbcTemplate> externalJdbcTemplates(Environment env) {
        log.info("Creating external JdbcTemplates...");
        Map<String, JdbcTemplate> map = new HashMap<>();

        String namesProperty = env.getProperty("external-dbs.names");
        log.info("external-dbs.names property: {}", namesProperty);
        
        if (namesProperty == null || namesProperty.trim().isEmpty()) {
            log.error("external-dbs.names property is null or empty!");
            return map;
        }

        String[] names = namesProperty.split(",");
        log.info("Processing {} external databases: {}", names.length, String.join(", ", names));

        for (String name : names) {
            String trimmedName = name.trim();
            String prefix = "external-dbs." + trimmedName;
            
            log.info("Configuring database: {} with prefix: {}", trimmedName, prefix);

            String url = env.getProperty(prefix + ".url");
            String username = env.getProperty(prefix + ".username");
            String password = env.getProperty(prefix + ".password");
            
            log.info("Database {} - URL: {}, Username: {}", trimmedName, url, username);
            
            if (url == null || username == null || password == null) {
                log.error("Missing configuration for database {}: url={}, username={}, password={}", 
                         trimmedName, url, username, password != null ? "***" : "null");
                continue;
            }

            HikariDataSource ds = new HikariDataSource();
            ds.setJdbcUrl(url);
            ds.setUsername(username);
            ds.setPassword(password);
            ds.setDriverClassName(
                    env.getProperty(prefix + ".driver-class-name",
                            "com.mysql.cj.jdbc.Driver")
            );

            ds.setMaximumPoolSize(
                    env.getProperty("external-dbs.hikari.maximum-pool-size",
                            Integer.class, 2)
            );
            ds.setConnectionTimeout(
                    env.getProperty("external-dbs.hikari.connection-timeout",
                            Long.class, 3000L)
            );

            map.put(trimmedName, new JdbcTemplate(ds));
            log.info("Successfully created JdbcTemplate for database: {}", trimmedName);
        }

        log.info("Created {} JdbcTemplates: {}", map.size(), map.keySet());
        return map;
    }
}
