package com.contestapp.aiService.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfilingAnswerResponse {

    private String questionId;
    private String answer;

}
