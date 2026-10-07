package com.lumi;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class AuthService {

    private final RestClient restClient;
    private final String sheetsUrl;

    public AuthService(@Value("${google.sheets.url}") String sheetsUrl) {
        this.sheetsUrl = sheetsUrl;
        this.restClient = RestClient.builder().build();
    }

    public String signup(SignupRequest request) {

        User user = new User(
                request.name(),
                request.email(),
                request.password()
        );

        Map<String, String> data = Map.of(
                "name", user.getName(),
                "email", user.getEmail(),
                "password", user.getPassword()
        );

        restClient.post()
                .uri(sheetsUrl)
                .body(data)
                .retrieve()
                .toBodilessEntity();

        return "User registered successfully: " + user.getEmail();
    }
}