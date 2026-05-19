package com.example.lrms.service;

import com.example.lrms.dto.AuthRequest;
import com.example.lrms.dto.AuthResponse;
import com.example.lrms.dto.RegisterRequest;
import com.example.lrms.entity.User;
import com.example.lrms.repository.UserRepository;
import com.example.lrms.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        var user = User.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .email(request.getEmail())
                .role(request.getRole())
                .isActive(true)
                .build();
        
        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user, user.getRole().name());
        return AuthResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .userId(user.getId())
                .build();
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();
        var jwtToken = jwtService.generateToken(user, user.getRole().name());
        return AuthResponse.builder()
                .token(jwtToken)
                .role(user.getRole().name())
                .userId(user.getId())
                .build();
    }
}
