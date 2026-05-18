package com.example.lrms.config;

import com.example.lrms.dto.RegisterRequest;
import com.example.lrms.entity.Role;
import com.example.lrms.repository.UserRepository;
import com.example.lrms.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AuthService authService;

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
    }
}
