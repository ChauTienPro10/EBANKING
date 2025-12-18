package com.ebanking.adminTool.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class ExternalDbConfig {

    @Bean
    public Map<String, JdbcTemplate> externalJdbcTemplates(Environment env) {
        Map<String, JdbcTemplate> map = new HashMap<>();

        String[] names = env.getProperty("external-dbs.names").split(",");

        for (String name : names) {
            String prefix = "external-dbs." + name;

            HikariDataSource ds = new HikariDataSource();
            ds.setJdbcUrl(env.getProperty(prefix + ".url"));
            ds.setUsername(env.getProperty(prefix + ".username"));
            ds.setPassword(env.getProperty(prefix + ".password"));
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

            map.put(name, new JdbcTemplate(ds));
        }

        return map;
    }
}
