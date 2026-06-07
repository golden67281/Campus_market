package com.campusmarket.server;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ServerApplication {

    public static void main(String[] args) {
        // Load dotenv configuration if the file exists
        try {
            Dotenv dotenv = Dotenv.configure()
                    .ignoreIfMissing()
                    .load();
            dotenv.entries().forEach(entry -> {
                if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                    System.setProperty(entry.getKey(), entry.getValue());
                }
            });
        } catch (Exception e) {
            System.out.println("⚠️ Could not load .env file: " + e.getMessage());
        }

        // Print environment keys for debugging on Render
        System.out.println("====== STARTUP ENVIRONMENT DIAGNOSTICS ======");
        System.getenv().forEach((key, value) -> {
            if (key.contains("MONGO") || key.contains("PORT") || key.contains("JWT") || key.contains("SMTP") || key.contains("GMAIL")) {
                System.out.println("🔑 Env Key: " + key + " = " + (value != null && !value.trim().isEmpty() ? "[PRESENT (length: " + value.length() + ")]" : "[EMPTY]"));
            }
        });
        System.out.println("=============================================");

        var context = SpringApplication.run(ServerApplication.class, args);
        try {
            String resolvedUri = context.getEnvironment().getProperty("spring.data.mongodb.uri");
            if (resolvedUri != null) {
                // Safely mask the password between : and @ for security
                String masked = resolvedUri.replaceAll("(?<=://[^:]+:)[^@]+(?=@)", "*****");
                System.out.println("🍀 RESOLVED spring.data.mongodb.uri = " + masked);
            } else {
                System.out.println("🍀 RESOLVED spring.data.mongodb.uri = null");
            }
        } catch (Exception e) {
            System.out.println("⚠️ Could not log resolved URI: " + e.getMessage());
        }
    }
}


