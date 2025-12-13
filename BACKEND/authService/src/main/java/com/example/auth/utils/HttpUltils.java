package com.example.auth.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
@Component
public class HttpUltils {

    @Autowired
    private RestTemplate restTemplate;

    // Phương thức GET
    public <T> T get(String url, Class<T> responseType) {
        return restTemplate.getForObject(url, responseType);
    }

    public <T> T get(String url, ParameterizedTypeReference<T> type) {
        ResponseEntity<T> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                type
        );
        return response.getBody();
    }


    // Phương thức POST với body
    public <T, R> R post(String url, T requestBody, Class<R> responseType) {
        return restTemplate.postForObject(url, requestBody, responseType);
    }

    // Phương thức POST nâng cao với headers
    public <T, R> ResponseEntity<R> postWithHeaders(String url, T requestBody, Class<R> responseType, HttpHeaders headers) {
        HttpEntity<T> entity = new HttpEntity<>(requestBody, headers);
        return restTemplate.exchange(url, HttpMethod.POST, entity, responseType);
    }

    // Phương thức GET nâng cao với headers
    public <R> ResponseEntity<R> getWithHeaders(String url, Class<R> responseType, HttpHeaders headers) {
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        return restTemplate.exchange(url, HttpMethod.GET, entity, responseType);
    }
}
