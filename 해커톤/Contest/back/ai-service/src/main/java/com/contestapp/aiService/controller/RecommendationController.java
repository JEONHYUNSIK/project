package com.contestapp.aiService.controller;

import com.contestapp.aiService.dto.ContestRecommendationRequest;
import com.contestapp.aiService.entity.Recommendations;
import com.contestapp.aiService.service.RecommendationService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class RecommendationController  {   

    private final RecommendationService recommendationService;

    @PostMapping("/recommendations/contests")
    public ResponseEntity<List<Recommendations>> recommendContests(
            @RequestBody ContestRecommendationRequest request) {

                List<Recommendations> recommendations = recommendationService.getRecommendations(request.userId, "CONTEST");

                return ResponseEntity.ok(recommendations);
    }
} 