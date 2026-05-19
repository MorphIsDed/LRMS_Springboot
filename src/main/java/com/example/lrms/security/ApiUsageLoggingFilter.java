package com.example.lrms.security;

import com.example.lrms.entity.ApiKey;
import com.example.lrms.entity.ApiUsageLog;
import com.example.lrms.repository.ApiUsageLogRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;

@RequiredArgsConstructor
public class ApiUsageLoggingFilter extends OncePerRequestFilter {

    private final ApiUsageLogRepository apiUsageLogRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        if (!request.getRequestURI().startsWith("/api/v1/partners")) {
            filterChain.doFilter(request, response);
            return;
        }

        long startTime = System.currentTimeMillis();
        ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);

        try {
            filterChain.doFilter(request, responseWrapper);
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            int status = responseWrapper.getStatus();
            responseWrapper.copyBodyToResponse(); // Important: copy the response body back

            logUsage(request, status, duration);
        }
    }

    private void logUsage(HttpServletRequest request, int status, long duration) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof ApiKey) {
            ApiKey apiKey = (ApiKey) auth.getPrincipal();
            
            ApiUsageLog log = ApiUsageLog.builder()
                    .apiKey(apiKey)
                    .method(request.getMethod())
                    .endpoint(request.getRequestURI())
                    .httpStatus(status)
                    .responseTimeMs(duration)
                    .build();
            
            apiUsageLogRepository.save(log);
        }
    }
}
