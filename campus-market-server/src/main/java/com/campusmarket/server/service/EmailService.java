package com.campusmarket.server.service;

public interface EmailService {
    void sendVerificationOTP(String toEmail, String otp, String userName);
    boolean isMailerConfigured();
}
