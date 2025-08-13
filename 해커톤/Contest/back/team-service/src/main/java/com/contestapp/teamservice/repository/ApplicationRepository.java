package com.contestapp.teamservice.repository;

import com.contestapp.teamservice.entity.ApplicationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;


public interface ApplicationRepository extends JpaRepository<ApplicationEntity, UUID> {
    List<ApplicationEntity> findByUserId(UUID userId);
    List<ApplicationEntity> findByTeamId(UUID teamId);
    boolean existsByTeamIdAndUserIdAndStatus(UUID teamId, UUID userId, String status);
}