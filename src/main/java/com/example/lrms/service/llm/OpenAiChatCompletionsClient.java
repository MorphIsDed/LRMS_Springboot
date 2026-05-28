package com.example.lrms.service.llm;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Minimal OpenAI client.
 *
 * If OPENAI_API_KEY is not configured, callers should fall back to a non-LLM path.
 * This keeps the feature buildable/runnable in offline or restricted environments.
 */
@Component
@RequiredArgsConstructor
public class OpenAiChatCompletionsClient implements LlmClient {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${GROQ_API_KEY:}")
    private String apiKey;

    @Value("${GROQ_MODEL:llama3-8b-8192}")
    private String model;

    @Override
    public LlmResult generateMarkdown(String systemPrompt, String userPrompt) {
        if (apiKey == null || apiKey.isBlank()) {
            return new LlmResult(false, null);
        }

        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("model", model);
            payload.put("temperature", 0.3);
            payload.put("messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userPrompt)
            ));

            String body = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.groq.com/openai/v1/chat/completions"))
                    .timeout(Duration.ofSeconds(30))
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() / 100 != 2) {
                return new LlmResult(false, null);
            }

            JsonNode root = objectMapper.readTree(response.body());
            String content = root.path("choices").path(0).path("message").path("content").asText(null);
            if (content == null || content.isBlank()) {
                return new LlmResult(false, null);
            }

            return new LlmResult(true, content.trim());
        } catch (Exception e) {
            return new LlmResult(false, null);
        }
    }
}

