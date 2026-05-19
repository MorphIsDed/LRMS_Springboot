package com.example.lrms.config;

import com.example.lrms.dto.RegisterRequest;
import com.example.lrms.entity.Role;
import com.example.lrms.entity.User;
import com.example.lrms.entity.ApiKey;
import com.example.lrms.repository.UserRepository;
import com.example.lrms.repository.ApiKeyRepository;
import com.example.lrms.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final ApiKeyRepository apiKeyRepository;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByUsername("admin")) {
            RegisterRequest adminRequest = new RegisterRequest();
            adminRequest.setUsername("admin");
            adminRequest.setPassword("admin123");
            adminRequest.setEmail("admin@lrms.com");
            adminRequest.setRole(Role.ADMIN);
            
            try {
                authService.register(adminRequest);
                System.out.println("Default Admin user created: admin / admin123");
            } catch (Exception e) {
                System.out.println("Failed to seed admin user: " + e.getMessage());
            }
        }

        // Seed Zomato system user and API Key
        if (!userRepository.existsByUsername("zomato_system")) {
            RegisterRequest zomatoRequest = new RegisterRequest();
            zomatoRequest.setUsername("zomato_system");
            zomatoRequest.setPassword(UUID.randomUUID().toString()); // Unusable password
            zomatoRequest.setEmail("system@zomato.com");
            zomatoRequest.setRole(Role.GUEST); // Required by BookingService

            try {
                authService.register(zomatoRequest);
                User zomatoUser = userRepository.findByUsername("zomato_system").orElseThrow();

                String rawKey = "test_zomato_key_12345";
                String keyHash = hashKey(rawKey);

                ApiKey apiKey = ApiKey.builder()
                        .partnerName("Zomato")
                        .keyHash(keyHash)
                        .isActive(true)
                        .systemUser(zomatoUser)
                        .build();

                apiKeyRepository.save(apiKey);
                System.out.println("==================================================");
                System.out.println("TEST API KEY SEEDED FOR ZOMATO:");
                System.out.println("X-API-KEY: " + rawKey);
                System.out.println("==================================================");

            } catch (Exception e) {
                System.out.println("Failed to seed zomato system user/key: " + e.getMessage());
            }
        }
    }

    private String hashKey(String key) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hashBytes = digest.digest(key.getBytes(StandardCharsets.UTF_8));
        StringBuilder hexString = new StringBuilder(2 * hashBytes.length);
        for (byte b : hashBytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
