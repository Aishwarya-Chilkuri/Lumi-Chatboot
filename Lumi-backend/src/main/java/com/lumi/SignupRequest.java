package com.lumi;

public record SignupRequest(
        String name,
        String email,
        String password
) {
}

