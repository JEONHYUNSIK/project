package com.contestapp.teamservice.repository;

import com.contestapp.teamservice.entity.Invitations; // Invitations 엔티티 import
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID; // UUID 타입 import

// JpaRepository를 상속받아 기본적인 CRUD 기능을 자동으로 제공받습니다.
// <엔티티 클래스, 엔티티의 ID 타입>
public interface InvitationRepository extends JpaRepository<Invitations, UUID> {

    // 특정 팀에 대한 모든 초대 목록을 조회합니다. (팀 관리 페이지 등에서 사용)
    List<Invitations> findByTeamId(UUID teamId);

    // 특정 사용자가 받은 모든 초대 목록을 조회합니다. (사용자의 '내 초대' 페이지 등에서 사용)
    List<Invitations> findByUserId(UUID userId);

    // 특정 팀과 특정 사용자에게 보류 중인(PENDING) 초대장이 있는지 확인합니다. (중복 초대 방지 등)
    Optional<Invitations> findByTeamIdAndUserIdAndStatus(UUID teamId, UUID userId, String status);

    // 만료된 초대장을 조회합니다. (예: 만료된 초대를 정리하는 스케줄러 등에서 사용 가능)
    // List<Invitations> findByExpiresAtBeforeAndStatus(LocalDateTime now, String status);
}