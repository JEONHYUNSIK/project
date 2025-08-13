package com.contestapp.teamservice.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.contestapp.teamservice.entity.Invitations;
import com.contestapp.teamservice.repository.InvitationRepository;
import com.contestapp.teamservice.repository.TeamMembersRepository; // 🌟 TeamMembersRepository 임포트 추가

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvitationService {

    private final InvitationRepository invitationRepository;
    private final TeamsService teamsService;
    private final TeamMembersRepository teamMembersRepository; // 🌟 TeamMembersRepository 의존성 주입

    @Transactional
    public Invitations createInvitation(UUID teamId, UUID invitedUserId, String message) {
        Optional<Invitations> existingInvitation = invitationRepository.findByTeamIdAndUserIdAndStatus(
                teamId, invitedUserId, "PENDING");
        if (existingInvitation.isPresent()) {
            throw new IllegalArgumentException("해당 사용자에게 이미 보류 중인 초대장이 존재합니다.");
        }
        Invitations invitation = new Invitations();
        invitation.setTeamId(teamId);
        invitation.setUserId(invitedUserId);
        invitation.setMessage(message);
        invitation.setStatus("PENDING");
        return invitationRepository.save(invitation);
    }

    @Transactional(readOnly = true)
    public List<Invitations> getInvitationsForUser(UUID userId) {
        return invitationRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Invitations> getInvitationsForTeam(UUID teamId) {
        return invitationRepository.findByTeamId(teamId);
    }

    @Transactional
    public Invitations acceptInvitation(UUID invitationId, UUID userId) {
        Invitations invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 초대장입니다."));

        if (!invitation.getUserId().equals(userId)) {
            throw new IllegalArgumentException("이 초대장을 수락할 권한이 없습니다.");
        }
        
        // 🌟 teamsService를 거치지 않고 TeamMembersRepository를 직접 호출하여 테스트
        boolean isMember = teamMembersRepository.existsByTeamIdAndUserId(invitation.getTeamId(), invitation.getUserId());
        
        if (isMember) {
            log.warn("초대 수락 실패: 이미 팀의 멤버입니다. teamId={}, userId={}", invitation.getTeamId(), invitation.getUserId());
            throw new IllegalArgumentException("이미 해당 팀의 멤버입니다.");
        }
        
        if (!"PENDING".equals(invitation.getStatus())) {
            throw new IllegalArgumentException("이미 처리되었거나 유효하지 않은 초대장입니다.");
        }

        if (invitation.getExpiresAt() != null && invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus("EXPIRED");
            invitationRepository.save(invitation);
            throw new IllegalArgumentException("만료된 초대장입니다.");
        }

        invitation.setStatus("ACCEPTED");
        Invitations acceptedInvitation = invitationRepository.save(invitation);

        teamsService.addTeamMember(acceptedInvitation.getTeamId(), acceptedInvitation.getUserId(), "member");
        return acceptedInvitation;
    }

    @Transactional
    public Invitations rejectInvitation(UUID invitationId, UUID userId) {
        Invitations invitation = invitationRepository.findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 초대장입니다."));

        if (!invitation.getUserId().equals(userId)) {
            throw new IllegalArgumentException("이 초대장을 거절할 권한이 없습니다.");
        }

        if (!"PENDING".equals(invitation.getStatus())) {
            throw new IllegalArgumentException("이미 처리되었거나 유효하지 않은 초대장입니다.");
        }

        invitation.setStatus("REJECTED");
        return invitationRepository.save(invitation);
    }
}