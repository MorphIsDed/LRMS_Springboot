package com.example.lrms.config;

import com.example.lrms.dto.RegisterRequest;
import com.example.lrms.entity.Role;
import com.example.lrms.entity.User;
import com.example.lrms.entity.ApiKey;
import com.example.lrms.entity.Room;
import com.example.lrms.entity.MenuItem;
import com.example.lrms.repository.UserRepository;
import com.example.lrms.repository.ApiKeyRepository;
import com.example.lrms.repository.RoomRepository;
import com.example.lrms.repository.MenuItemRepository;
import com.example.lrms.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final UserService userService;
    private final ApiKeyRepository apiKeyRepository;
    private final RoomRepository roomRepository;
    private final MenuItemRepository menuItemRepository;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByUsername("admin")) {
            RegisterRequest adminRequest = new RegisterRequest();
            adminRequest.setUsername("admin");
            adminRequest.setPassword("admin123");
            adminRequest.setEmail("admin@lrms.com");
            adminRequest.setRole(Role.ADMIN);
            
            try {
                userService.createUser(adminRequest);
                log.warn("Default Admin user created: admin / admin123");
            } catch (Exception e) {
                log.error("Failed to seed admin user: {}", e.getMessage());
            }
        }

        seedStaffUser("receptionist", "reception123", "receptionist@lrms.com", Role.RECEPTIONIST);
        seedStaffUser("waiter", "waiter123", "waiter@lrms.com", Role.WAITER);
        seedStaffUser("chef", "chef123", "chef@lrms.com", Role.CHEF);

        seedRooms();
        seedMenuItems();

        // Seed Zomato system user and API Key
        if (!userRepository.existsByUsername("zomato_system")) {
            RegisterRequest zomatoRequest = new RegisterRequest();
            zomatoRequest.setUsername("zomato_system");
            zomatoRequest.setPassword(UUID.randomUUID().toString()); // Unusable password
            zomatoRequest.setEmail("system@zomato.com");
            zomatoRequest.setRole(Role.GUEST); // Required by BookingService

            try {
                userService.createUser(zomatoRequest);
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
                log.warn("==================================================");
                log.warn("TEST API KEY SEEDED FOR ZOMATO:");
                log.warn("X-API-KEY: {}", rawKey);
                log.warn("==================================================");

            } catch (Exception e) {
                log.error("Failed to seed zomato system user/key: {}", e.getMessage());
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

    private void seedStaffUser(String username, String password, String email, Role role) {
        if (!userRepository.existsByUsername(username)) {
            RegisterRequest request = new RegisterRequest();
            request.setUsername(username);
            request.setPassword(password);
            request.setEmail(email);
            request.setRole(role);
            try {
                userService.createUser(request);
                log.warn("Default {} user created: {} / {}", role.name(), username, password);
            } catch (Exception e) {
                log.error("Failed to seed {} user: {}", role.name(), e.getMessage());
            }
        }
    }

    private void seedRooms() {
        if (roomRepository.count() == 0) {
            roomRepository.save(Room.builder().roomNumber("101").roomType(Room.RoomType.SINGLE).floor((short) 1).baseRate(new BigDecimal("100.00")).maxOccupancy((short) 1).status(Room.RoomStatus.AVAILABLE).build());
            roomRepository.save(Room.builder().roomNumber("102").roomType(Room.RoomType.DOUBLE).floor((short) 1).baseRate(new BigDecimal("150.00")).maxOccupancy((short) 2).status(Room.RoomStatus.AVAILABLE).build());
            roomRepository.save(Room.builder().roomNumber("201").roomType(Room.RoomType.SUITE).floor((short) 2).baseRate(new BigDecimal("300.00")).maxOccupancy((short) 4).status(Room.RoomStatus.AVAILABLE).build());
            roomRepository.save(Room.builder().roomNumber("202").roomType(Room.RoomType.DELUXE).floor((short) 2).baseRate(new BigDecimal("250.00")).maxOccupancy((short) 2).status(Room.RoomStatus.AVAILABLE).build());
            log.warn("Default rooms seeded.");
        }
    }

    private void seedMenuItems() {
        if (menuItemRepository.count() == 0) {
            menuItemRepository.save(MenuItem.builder().name("Caesar Salad").category(MenuItem.MenuItemCategory.STARTER).price(new BigDecimal("12.99")).description("Fresh romaine, croutons, parmesan").isAvailable(true).inventoryCount(50).build());
            menuItemRepository.save(MenuItem.builder().name("Grilled Salmon").category(MenuItem.MenuItemCategory.MAIN).price(new BigDecimal("28.50")).description("Wild caught salmon with asparagus").isAvailable(true).inventoryCount(20).build());
            menuItemRepository.save(MenuItem.builder().name("Cheesecake").category(MenuItem.MenuItemCategory.DESSERT).price(new BigDecimal("9.00")).description("New York style cheesecake").isAvailable(true).inventoryCount(15).build());
            menuItemRepository.save(MenuItem.builder().name("Craft Cola").category(MenuItem.MenuItemCategory.BEVERAGE).price(new BigDecimal("4.00")).description("Local craft soda").isAvailable(true).inventoryCount(100).build());
            log.warn("Default menu items seeded.");
        }
    }
}
