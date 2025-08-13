package com.contestapp.aiService.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "feedback")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Feedback implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(columnDefinition = "UUID")
    private UUID user_id;

    @Column(columnDefinition = "UUID")
    private UUID recommendation_id;

    @Column(name = "rating")
    private int rating;

    @Column(name = "comment")
    private String comment;

    @Column(name = "created_at")
    private LocalDateTime created_at;


    @Builder
    public Feedback(UUID user_id, UUID recommendation_id, int rating, String comment, LocalDateTime created_at) {
        this.user_id = user_id;
        this.recommendation_id = recommendation_id;
        this.rating = rating;
        this.comment = comment;
        this.created_at = created_at;
       
    }
} 