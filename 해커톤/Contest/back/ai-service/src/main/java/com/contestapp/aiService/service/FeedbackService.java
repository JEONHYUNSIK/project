package com.contestapp.aiService.service;

import com.contestapp.aiService.dto.ContestRecommendationRequest;
import com.contestapp.aiService.entity.Recommendations;
import com.contestapp.aiService.repository.FeedbackRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FeedbackService {


    // private final FeedbackRepository feedbackRepository;

    // public void getProfilingQuestions() {
    //     // TODO Auto-generated method stub
    //     throw new UnsupportedOperationException("Unimplemented method 'getProfilingQuestions'");
    // }

    // public List<Recommendations> recommendContests(ContestRecommendationRequest request) {
    //     // TODO Auto-generated method stub
    //     throw new UnsupportedOperationException("Unimplemented method 'recommendContests'");
    // }

} 