package com.example.lrms.service.llm;

public interface LlmClient {
    LlmResult generateMarkdown(String systemPrompt, String userPrompt);

    record LlmResult(boolean usedLlm, String markdown) {
    }
}

