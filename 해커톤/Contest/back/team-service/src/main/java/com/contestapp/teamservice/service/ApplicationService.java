package com.contestapp.teamservice.service;

import com.contestapp.teamservice.dto.request.ApplicationRequest;
import com.contestapp.teamservice.dto.response.ApplicationResponse;
import com.contestapp.teamservice.entity.ApplicationEntity;
import com.contestapp.teamservice.entity.Teams;
import com.contestapp.teamservice.repository.ApplicationRepository;
import com.contestapp.teamservice.repository.TeamsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final TeamsRepository teamsRepository;
    private final TeamsService teamsService;

    private static final String STATUS_PENDING = "신청";
    private static final String STATUS_APPROVED = "승인";
    private static final String STATUS_REJECTED = "거절";

    /**
     * 팀 지원 신청
     */
    @Transactional
    public ApplicationResponse applyToTeam(UUID teamId, UUID userId, ApplicationRequest request) {

        // 중복 지원 체크
        boolean alreadyApplied = applicationRepository.existsByTeamIdAndUserIdAndStatus(teamId, userId, STATUS_PENDING);
        if (alreadyApplied) {
            throw new IllegalStateException("이미 해당 팀에 지원한 상태입니다.");
        }

        // 이미 팀 멤버인지 확인
        if (teamsService.isMemberOfTeam(teamId, userId)) {
            throw new IllegalStateException("이미 해당 팀의 멤버입니다.");
        }

        ApplicationEntity entity = ApplicationEntity.builder()
                .teamId(teamId)
                .userId(userId)
                .message(request.getMessage())
                .status(STATUS_PENDING)
                .build();

        ApplicationEntity saved = applicationRepository.save(entity);
        return ApplicationResponse.fromEntity(saved);
    }

    /**
     * 팀 지원 목록 조회
     */
    public List<ApplicationResponse> getApplicationsByTeam(UUID teamId) {
        return applicationRepository.findByTeamId(teamId).stream()
                .map(ApplicationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 내 지원서 목록 조회
     */
    public List<ApplicationResponse> getMyApplications(UUID userId) {
        return applicationRepository.findByUserId(userId).stream()
                .map(ApplicationResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 지원 승인
     */
    @Transactional
    public ApplicationResponse approve(UUID applicationId, UUID approverId) {
        ApplicationEntity application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("지원서를 찾을 수 없습니다."));

        Teams team = teamsRepository.findById(application.getTeamId())
                .orElseThrow(() -> new RuntimeException("팀을 찾을 수 없습니다."));

        if (!team.getLeaderId().equals(approverId)) {
            throw new SecurityException("팀장만 승인할 수 있습니다.");
        }

        if (!application.getStatus().equals(STATUS_PENDING)) {
            throw new IllegalStateException("이미 처리된 지원입니다.");
        }

        if (teamsService.isMemberOfTeam(application.getTeamId(), application.getUserId())) {
            throw new IllegalStateException("이미 해당 팀의 멤버입니다.");
        }

        application.setStatus(STATUS_APPROVED);
        ApplicationEntity saved = applicationRepository.save(application);

        teamsService.addTeamMember(saved.getTeamId(), saved.getUserId(), "member");

        return ApplicationResponse.fromEntity(saved);
    }

    /**
     * 지원 거절
     */
    @Transactional
    public ApplicationResponse reject(UUID applicationId, UUID approverId) {
        ApplicationEntity application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("지원서를 찾을 수 없습니다."));

        Teams team = teamsRepository.findById(application.getTeamId())
                .orElseThrow(() -> new RuntimeException("팀을 찾을 수 없습니다."));

        if (!team.getLeaderId().equals(approverId)) {
            throw new SecurityException("팀장만 거절할 수 있습니다.");
        }

        if (!application.getStatus().equals(STATUS_PENDING)) {
            throw new IllegalStateException("이미 처리된 지원입니다.");
        }

        application.setStatus(STATUS_REJECTED);
        return ApplicationResponse.fromEntity(applicationRepository.save(application));
    }

    /**
     * 지원 취소
     */
    @Transactional
    public void cancel(UUID applicationId, UUID userId) {
        ApplicationEntity application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("지원서를 찾을 수 없습니다."));

        if (!application.getUserId().equals(userId)) {
            throw new SecurityException("본인의 지원서만 취소할 수 있습니다.");
        }

        if (!application.getStatus().equals(STATUS_PENDING)) {
            throw new IllegalStateException("처리된 지원서는 취소할 수 없습니다.");
        }

        applicationRepository.delete(application);
    }
}