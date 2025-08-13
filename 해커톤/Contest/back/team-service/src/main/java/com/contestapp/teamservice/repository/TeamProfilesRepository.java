package com.contestapp.teamservice.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.contestapp.teamservice.entity.TeamProfiles;

@Repository
public interface TeamProfilesRepository extends JpaRepository<TeamProfiles, UUID> {
    // 🌟🌟🌟 이 메서드를 추가해야 합니다. 🌟🌟🌟
    Optional<TeamProfiles> findByTeamId(UUID teamId);
    // 🌟🌟🌟 추가 완료 🌟🌟🌟
}