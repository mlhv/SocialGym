package com.socialgym.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.exc.JsonNodeException;

import java.util.List;
import java.util.Map;

@Service
public class AiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${openai.model}")
    private String model;

    public AiService(@Value("${openai.api.key}") String apiKey,
                     @Value("${openai.api.url}") String apiUrl,
                     ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
        this.restClient = RestClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }

    private static final String DATING_PROMPT =
            "You are a dating coach. " +
                    "1. Reply to the user as a potential date (flirty but guarded). " +
                    "2. Rate their response (0-100) based on charisma and empathy. " +
                    "3. Give a 1-sentence tip on how to be more engaging. " +
                    "Return JSON: { 'reply_text': '...', 'score': 0, 'feedback': '...' }";

    private static final String DEBATE_PROMPT =
            "You are a debate opponent. " +
                    "1. Reply to the user by countering their argument. " +
                    "2. Rate their response (0-100) based on logical consistency. " +
                    "3. If they used a logical fallacy, point it out in the feedback. " +
                    "Return JSON: { 'reply_text': '...', 'score': 0, 'feedback': '...' }";

    public Map<String, Object> getAnalysis(String userMessage, String gameMode) {

        String systemPrompt = "DEBATE".equalsIgnoreCase(gameMode) ? DEBATE_PROMPT : DATING_PROMPT;

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)
                ),
                "response_format", Map.of("type", "json_object")
        );

        String rawResponse = restClient.post()
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .retrieve()
                .body(String.class);

        try {
            JsonNode rootNode = objectMapper.readTree(rawResponse);
            String contentString = rootNode.path("choices")
                    .get(0).path("message").path("content").asString();

            JsonNode innerNode = objectMapper.readTree(contentString);

            return Map.of(
                    "reply_text", innerNode.path("reply_text").asString(),
                    "score", innerNode.path("score").asInt(),
                    "feedback", innerNode.path("feedback").asString()
            );
        } catch (JsonNodeException e) {
            return Map.of("score", 0, "feedback", "Error parsing AI response.");
        }
    }
}
