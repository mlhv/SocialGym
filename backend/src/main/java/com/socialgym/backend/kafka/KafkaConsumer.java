package com.socialgym.backend.kafka;

import com.socialgym.backend.model.ChatMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class KafkaConsumer {
    @KafkaListener(topics = "social-events", groupId = "socialgym-analytics")
    public void consume(ChatMessage message) {
        // Pretend this is a heavy analytics calculation
        log.info("📊 KAFKA ANALYTICS RECEIVED: User '{}' sent a message. Score: {}",
                message.getSender(),
                message.getScore() != null ? message.getScore() : "N/A");

        if (message.getScore() != null && message.getScore() < 50) {
            log.warn("🚩 LOW VIBE ALERT! User {} needs help.", message.getSender());
        }
    }
}
