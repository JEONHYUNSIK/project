package com.contestapp.aiService.repository;

import com.contestapp.aiService.dto.FeedbackResponse;
import com.contestapp.aiService.entity.Feedback;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {
    // /**
    //  * 사용자 ID로 AiSettings 조회
    //  * @param userId 사용자 ID
    //  * @return FeedbackResponse
    //  */
    // FeedbackResponse findByUserId(UUID userId);

} 