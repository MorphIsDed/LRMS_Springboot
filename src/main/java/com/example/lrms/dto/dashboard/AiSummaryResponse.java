package com.example.lrms.dto.dashboard;

public record AiSummaryResponse(
        String generatedAt,
        boolean usedLlm,
        String summaryMarkdown
) {
}

