package com.contestapp.aiService.repository;

import com.contestapp.aiService.entity.UserProfiling;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserProfilingRepository extends JpaRepository<UserProfiling, UUID> {
    Optional<UserProfiling> findByUserId(UUID userId);
}