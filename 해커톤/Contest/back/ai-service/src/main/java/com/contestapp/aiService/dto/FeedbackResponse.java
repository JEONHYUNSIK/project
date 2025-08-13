package com.contestapp.aiService.dto;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Data;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackResponse {
    
    private UUID user_id;   
    private UUID recommendation_id;   
    private int rating;   
    private String comment;    
    private LocalDateTime created_at;

    public static FeedbackResponse of(UUID userId, UUID recommendationId, int rating, String comment, LocalDateTime createdAt) {
        FeedbackResponse response = new FeedbackResponse();
        response.setUser_id(userId);
        response.setRecommendation_id(recommendationId);
        response.setRating(rating);
        response.setComment(comment);
        response.setCreated_at(createdAt);
        return response;
    }
}