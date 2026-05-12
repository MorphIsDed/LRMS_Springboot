package com.example.lrms.service;

import com.example.lrms.dto.AuthRequest;
import com.example.lrms.dto.AuthResponse;
import com.example.lrms.dto.RegisterRequest;
import com.example.lrms.entity.Role;
import com.example.lrms.entity.User;
import com.example.lrms.repository.UserRepository;
import com.example.lrms.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void register_ShouldReturnToken_WhenUserIsRegistered() {
        RegisterRequest request = new RegisterRequest("testuser", "password", "test@test.com", Role.GUEST);
        User user = new User();
        user.setUsername("testuser");
        user.setRole(Role.GUEST);

        when(userRepository.existsByUsername(request.getUsername())).thenReturn(false);
        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        when(jwtService.generateToken(any(), anyString())).thenReturn("mockToken");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mockToken", response.getToken());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void login_ShouldReturnToken_WhenCredentialsAreValid() {
        AuthRequest request = new AuthRequest("testuser", "password");
        User user = new User();
        user.setUsername("testuser");
        user.setRole(Role.GUEST);

        when(userRepository.findByUsername(request.getUsername())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(any(), anyString())).thenReturn("mockToken");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mockToken", response.getToken());
        verify(authenticationManager, times(1)).authenticate(any());
    }
}
