package com.socialgym.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "sentiment_score")
    private Double sentimentScore;

    private String sender;

    @Enumerated(EnumType.STRING)
    private MessageType type;

    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String feedback;
    private String gameMode;

    public enum MessageType {
        CHAT,
        JOIN,
        LEAVE
    }
}
