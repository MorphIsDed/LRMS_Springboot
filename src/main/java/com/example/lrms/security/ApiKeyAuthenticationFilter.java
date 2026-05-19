package com.example.lrms.security;

import com.example.lrms.entity.ApiKey;
import com.example.lrms.repository.ApiKeyRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;

@RequiredArgsConstructor
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private static final String API_KEY_HEADER = "X-API-KEY";
    private final ApiKeyRepository apiKeyRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // Only apply this filter to partner API paths
        if (!request.getRequestURI().startsWith("/api/v1/partners")) {
            filterChain.doFilter(request, response);
            return;
        }

        String reqApiKey = request.getHeader(API_KEY_HEADER);
        if (reqApiKey == null || reqApiKey.isBlank()) {
            sendUnauthorizedError(response, "Missing X-API-KEY header");
            return;
        }

        try {
            String keyHash = hashKey(reqApiKey);
            Optional<ApiKey> apiKeyOpt = apiKeyRepository.findByKeyHashAndIsActiveTrue(keyHash);

            if (apiKeyOpt.isPresent()) {
                ApiKey apiKey = apiKeyOpt.get();
                // We use PreAuthenticatedAuthenticationToken as we are pre-authenticated via API Key
                // The Principal is the ApiKey entity itself
                PreAuthenticatedAuthenticationToken authentication = new PreAuthenticatedAuthenticationToken(
                        apiKey, null, Collections.singletonList(new SimpleGrantedAuthority("ROLE_PARTNER")));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } else {
                sendUnauthorizedError(response, "Invalid or inactive API Key");
                return;
            }

        } catch (NoSuchAlgorithmException e) {
            sendUnauthorizedError(response, "Internal Server Error during auth");
            return;
        }

        filterChain.doFilter(request, response);
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

    private void sendUnauthorizedError(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        Map<String, Object> errorDetails = Map.of(
                "success", false,
                "message", message
        );
        response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
    }
}
