package com.contestapp.aiService.dto;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiSettingsRequest {   

    private UUID userId;  


    private boolean profilingCompleted;    

    private String recommendationFrequency;

} 