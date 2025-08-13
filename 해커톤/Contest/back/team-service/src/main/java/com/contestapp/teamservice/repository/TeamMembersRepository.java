package com.contestapp.teamservice.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.contestapp.teamservice.entity.TeamMembers;

@Repository
public interface TeamMembersRepository extends JpaRepository<TeamMembers, UUID>, JpaSpecificationExecutor<TeamMembers> {

    // 팀 ID로 모든 팀 멤버를 조회하는 메서드 추가
    List<TeamMembers> findByTeamId(UUID teamId);

    // 특정 팀에 특정 사용자가 멤버로 존재하는지 확인하는 메서드
    boolean existsByTeamIdAndUserId(UUID teamId, UUID userId);
}