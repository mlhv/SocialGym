package com.socialgym.backend.controller;

import com.socialgym.backend.model.ChatMessage;
import com.socialgym.backend.repository.ChatRepository;
import com.socialgym.backend.service.AiService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost", "http://127.0.0.1"})
public class ChatController {

    private final AiService aiService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRepository chatRepository;

    private final KafkaTemplate<String, ChatMessage> kafkaTemplate;
    // incoming: /app/chat.sendMessage (from react)
    // outgoing: /topic/public (to everyone)
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(@Payload ChatMessage chatMessage) {

        chatRepository.save(chatMessage);

        messagingTemplate.convertAndSend("/topic/public", chatMessage);

        kafkaTemplate.send("social-events", chatMessage);

        Map<String, Object> analysis = aiService.getAnalysis(
                chatMessage.getContent(),
                chatMessage.getGameMode()
        );

        ChatMessage aiResponse = ChatMessage.builder()
                        .type(ChatMessage.MessageType.CHAT)
                        .sender("AI Coach")
                        .content((String) analysis.get("reply_text"))
                        .score((Integer) analysis.get("score"))
                        .feedback((String) analysis.get("feedback"))
                        .gameMode(chatMessage.getGameMode())
                        .build();

        chatRepository.save(aiResponse);

        messagingTemplate.convertAndSend("/topic/public", aiResponse);
    }

    // incoming: /app/chat.addUser
    // outgoing: /topic/public
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/public")
    public ChatMessage addUser(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor) {
        // adds username to ws session, allows us to know who left if they disconnect suddenly
        headerAccessor.getSessionAttributes().put("username", chatMessage.getSender());

        return chatMessage;
    }

    @GetMapping("/history")
    public List<ChatMessage> getChatHistory() {
        return chatRepository.findAll();
    }

    @PostMapping("/api/sentiment")
    public void receiveSentiment(@RequestBody Map<String, Object> payload) {
        Long id = ((Number) payload.get("id")).longValue();
        Double score = (Double) payload.get("sentimentScore");

        // finds the message, update it, and broadcast it back to React
        chatRepository.findById(id).ifPresent(msg -> {
            msg.setSentimentScore(score);
            chatRepository.save(msg);
            messagingTemplate.convertAndSend("/topic/public", msg);
        });
    }



}
