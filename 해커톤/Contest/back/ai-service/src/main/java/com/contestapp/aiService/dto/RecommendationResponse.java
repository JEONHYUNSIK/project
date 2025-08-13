package com.contestapp.aiService.dto;

import java.util.UUID;

import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Data;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {

    private UUID entityId;
    private String entityType;
    private double score;
    private String reason;

    public static RecommendationResponse of(UUID entityId, String entityType, double score, String reason) {
        RecommendationResponse response = new RecommendationResponse();
        response.setEntityId(entityId);
        response.setEntityType(entityType);
        response.setScore(score);
        response.setReason(reason);
        return response;
    }
}