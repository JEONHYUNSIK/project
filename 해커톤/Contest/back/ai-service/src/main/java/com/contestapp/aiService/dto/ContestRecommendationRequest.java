package com.contestapp.aiService.dto;

import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContestRecommendationRequest  {

    public  UUID userId;
    public  int limit;

    // Getters and Setters
}
