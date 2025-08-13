package com.contestapp.aiService.repository;


import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.contestapp.aiService.entity.Recommendations;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendations, UUID> {
    //List<Recommendations> findByUserIdAndEntityType(UUID userId, String entityType);
}