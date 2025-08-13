package com.contestapp.aiService.service;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

import org.springframework.transaction.annotation.Transactional;

import com.contestapp.aiService.entity.Recommendations;
import com.contestapp.aiService.repository.RecommendationRepository;


import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RecommendationService {
    private final RecommendationRepository recommendationRepository;

    /**
     * 추천 기록 조회
     */
    public List<Recommendations> getRecommendations(UUID userId, String entityType) {
        return recommendationRepository.findAll();

    }
}
