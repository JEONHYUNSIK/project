package com.contestapp.aiService.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfilingAnswerRequest {
    private String question;
    private String answer;

}
