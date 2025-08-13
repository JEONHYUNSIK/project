package com.contestapp.aiService.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

import com.contestapp.aiService.util.RecommendationFrequency;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ai_settings")
@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AiSettings implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(columnDefinition = "UUID", name = "user_id")
    private UUID userId;

    @Column(name = "profiling_completed")
    private boolean profilingCompleted;

    @Enumerated(EnumType.STRING)
    @Column(name = "recommendation_frequency")
    private RecommendationFrequency recommendationFrequency;

    @Column(name = "created_at" )
    
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * 생성자
     * @param userId 사용자 ID
     * @param profilingCompleted 프로파일링 완료 여부
     * @param recommendationFrequency 추천 빈도
     * @param createdAt 생성 시간
     * @param updatedAt 업데이트 시간
     */

    public AiSettings(UUID userId, boolean profilingCompleted, RecommendationFrequency recommendationFrequency, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.userId = userId;
        this.profilingCompleted = profilingCompleted;
        this.recommendationFrequency = recommendationFrequency;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public void setProfilingCompleted(boolean profilingCompleted) {
       this.profilingCompleted = profilingCompleted;
    }
} 