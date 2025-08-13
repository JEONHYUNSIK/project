package com.contestapp.aiService.dto;


import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AiSettingsResponse { 

    private UUID userId;

    private boolean profilingCompleted;

    private String recommendationFrequency;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;



    public static AiSettingsResponse of(UUID userId, boolean profilingCompleted, String recommendationFrequency, LocalDateTime createdAt, LocalDateTime updatedAt) {
        return new AiSettingsResponse(userId, profilingCompleted, recommendationFrequency, createdAt, updatedAt);
    }

    
} 