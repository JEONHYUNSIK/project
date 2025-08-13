package com.contestapp.aiService.repository;

import com.contestapp.aiService.entity.AiSettings;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AiSettingsRepository extends JpaRepository<AiSettings, UUID> {
    Optional<AiSettings> findByUserId(UUID userId);

} 