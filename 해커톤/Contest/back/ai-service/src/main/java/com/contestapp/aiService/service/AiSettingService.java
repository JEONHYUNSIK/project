package com.contestapp.aiService.service;

import com.contestapp.aiService.entity.AiSettings;
import com.contestapp.aiService.repository.AiSettingsRepository;
import com.contestapp.aiService.util.RecommendationFrequency;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;



@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AiSettingService {
    
    private final AiSettingsRepository aiSettingsRepository;
    /**
     * 프로파일링 세션 시작
     * @param userId 사용자 ID
     * @return ResponseEntity<String>
     */
    @Transactional
    public ResponseEntity<String> startProfiling(UUID userId) {
        // 사용자 ID로 AiSettings 조회
        // 없으면 새로 생성
        AiSettings settings = aiSettingsRepository.findByUserId(userId)
            .orElseGet(() -> {
                AiSettings newSettings = new AiSettings( 
                    userId,
                    false, // 프로파일링 완료 여부 초기화
                    RecommendationFrequency.DAILY, // 추천 빈도 초기값 설정
                    LocalDateTime.now(),
                    LocalDateTime.now()
                );
                return aiSettingsRepository.save(newSettings);
            });

        // 프로파일링 완료 여부 초기화
        settings.setProfilingCompleted(false);
        aiSettingsRepository.save(settings);

        return ResponseEntity.ok("Profiling session started for user: " + userId);
    }

} 