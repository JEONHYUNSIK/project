// C:\Contest\back\team-service\src\main\java\com\contestapp\teamservice\service\TeamsService.java
package com.contestapp.teamservice.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.contestapp.teamservice.dto.request.TeamsCreateRequest;
import com.contestapp.teamservice.dto.request.TeamsUpdateRequest;
import com.contestapp.teamservice.dto.response.TeamMemberResponse;
import com.contestapp.teamservice.dto.response.TeamsResponse;
import com.contestapp.teamservice.entity.TeamMembers;
import com.contestapp.teamservice.entity.TeamProfiles;
import com.contestapp.teamservice.entity.Teams;
import com.contestapp.teamservice.repository.TeamMembersRepository;
import com.contestapp.teamservice.repository.TeamProfilesRepository;
import com.contestapp.teamservice.repository.TeamsRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamsService {

    private final TeamsRepository teamsRepository;
    private final ObjectMapper objectMapper;
    private final TeamMembersRepository teamMembersRepository;
    private final TeamProfilesRepository teamProfilesRepository;

    @Transactional
    public TeamsResponse createTeam(TeamsCreateRequest request) {
        log.info("팀 생성 요청: {}", request.getName());

        teamsRepository.findByName(request.getName()).ifPresent(team -> {
            throw new IllegalArgumentException("이미 존재하는 팀 이름입니다: " + request.getName());
        });

        String neededRolesJson = null;
        String skillsJson = null;
        String categoryIdsJson = null;

        try {
            if (request.getNeededRoles() != null) {
                neededRolesJson = objectMapper.writeValueAsString(request.getNeededRoles());
            }
            if (request.getSkills() != null) {
                skillsJson = objectMapper.writeValueAsString(request.getSkills());
            }
            if (request.getCategoryIds() != null) {
                categoryIdsJson = objectMapper.writeValueAsString(request.getCategoryIds());
            }
        } catch (JsonProcessingException e) {
            log.error("팀 역할/기술/카테고리 JSON 변환 중 오류 발생: {}", e.getMessage(), e);
            throw new IllegalArgumentException("팀 역할, 기술 또는 카테고리 데이터 처리 중 오류가 발생했습니다.");
        }

        Teams team = Teams.builder()
                .name(request.getName())
                .description(request.getDescription())
                .leaderId(request.getLeaderId())
                .contestId(request.getContestId())
                .isRecruiting(request.getIsRecruiting() != null ? request.getIsRecruiting() : true)
                .isPublic(request.getIsPublic() != null ? request.getIsPublic() : true)
                .maxMembers(request.getMaxMembers())
                .createdByUserId(request.getCreatedByUserId())
                .neededRolesJson(neededRolesJson)
                .skillsJson(skillsJson)
                .location(request.getLocation())
                .requirements(request.getRequirements())
                .contactMethod(request.getContactMethod())
                .contactInfo(request.getContactInfo())
                .allowDirectApply(request.getAllowDirectApply() != null ? request.getAllowDirectApply() : false)
                .categoryIdsJson(categoryIdsJson)
                .build();

        Teams savedTeam = teamsRepository.save(team);
        log.info("팀 생성 완료: ID={}, 이름={}", savedTeam.getId(), savedTeam.getName());

        TeamProfiles teamProfile = new TeamProfiles();
        teamProfile.setTeamId(savedTeam.getId());
        teamProfile.setLogoUrl(request.getLogoUrl());
        teamProfile.setWebsiteUrl(request.getWebsiteUrl());
        teamProfile.setGithubUrl(request.getGithubUrl());
        teamProfile.setRequiredRoles(neededRolesJson);
        teamProfile.setCreatedAt(LocalDateTime.now());
        teamProfile.setUpdatedAt(LocalDateTime.now());
        teamProfilesRepository.save(teamProfile);
        log.info("팀 프로필 생성 완료: teamId={}", savedTeam.getId());

        addTeamMember(savedTeam.getId(), savedTeam.getLeaderId(), "leader");

        return TeamsResponse.from(savedTeam);
    }

    @Transactional
    public void addTeamMember(UUID teamId, UUID userId, String role) {
        log.info("팀 멤버 추가 요청: teamId={}, userId={}, role={}", teamId, userId, role);

        if (teamMembersRepository.existsByTeamIdAndUserId(teamId, userId)) {
            log.warn("팀 멤버 추가 실패: 이미 존재하는 멤버입니다. teamId={}, userId={}", teamId, userId);
            return;
        }

        TeamMembers newMember = new TeamMembers();
        newMember.setTeamId(teamId);
        newMember.setUserId(userId);
        newMember.setRole(role);
        newMember.setJoinedAt(LocalDateTime.now());
        newMember.setActive(true);
        
        teamMembersRepository.save(newMember);

        log.info("팀 멤버 추가 완료: teamId={}, userId={}", teamId, userId);

        teamProfilesRepository.findByTeamId(teamId).ifPresent(profile -> {
            String existingRolesJson = profile.getRequiredRoles();
            try {
                List<String> roles = objectMapper.readValue(existingRolesJson, new TypeReference<List<String>>() {});
                roles.add(role);
                profile.setRequiredRoles(objectMapper.writeValueAsString(roles));
                profile.setUpdatedAt(LocalDateTime.now());
                teamProfilesRepository.save(profile);
                log.info("팀 프로필 역할 정보 업데이트 완료: teamId={}", teamId);
            } catch (JsonProcessingException e) {
                log.error("팀 프로필 역할 JSON 변환 중 오류 발생: {}", e.getMessage(), e);
            }
        });
    }

    @Transactional(readOnly = true)
    public boolean isMemberOfTeam(UUID teamId, UUID userId) {
        return teamMembersRepository.existsByTeamIdAndUserId(teamId, userId);
    }

    public TeamsResponse findTeamById(UUID teamId) {
        log.info("팀 ID로 조회 요청: {}", teamId);
        Teams team = teamsRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("ID: " + teamId + "에 해당하는 팀을 찾을 수 없습니다."));
        return TeamsResponse.from(team);
    }

    public List<TeamMemberResponse> findTeamMembers(UUID teamId) {
        log.info("팀원 목록 조회 서비스 요청: teamId={}", teamId);
        
        List<TeamMembers> members = teamMembersRepository.findByTeamId(teamId);

        return members.stream()
                      .map(member -> TeamMemberResponse.builder()
                                                      .userId(member.getUserId())
                                                      .role(member.getRole())
                                                      .is_active(member.isActive())
                                                      .joined_at(member.getJoinedAt())
                                                      .build())
                      .collect(Collectors.toList());
    }

    public Page<TeamsResponse> findTeams(UUID contestId, UUID leaderId, UUID createdByUserId,
                                         String status,
                                         String keyword,
                                         String location,
                                         String skill,
                                         String contactMethod,
                                         Boolean allowDirectApply,
                                         Pageable pageable) {
        log.info("팀 목록 조회 요청 - contestId: {}, leaderId: {}, createdByUserId: {}, status: {}, keyword: {}, location: {}, skill: {}, contactMethod: {}, allowDirectApply: {}",
                contestId, leaderId, createdByUserId, status, keyword, location, skill, contactMethod, allowDirectApply);

        Specification<Teams> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isTrue(root.get("isPublic")));

            if (status != null && !status.equals("전체")) {
                switch (status) {
                    case "모집중":
                        predicates.add(cb.isTrue(root.get("isRecruiting")));
                        break;
                    case "모집완료":
                        predicates.add(cb.isFalse(root.get("isRecruiting")));
                        break;
                    default:
                        log.warn("팀 목록 조회: 알 수 없는 'status' 값: {}", status);
                        break;
                }
            }

            if (contestId != null) {
                predicates.add(cb.equal(root.get("contestId"), contestId));
            }
            if (leaderId != null) {
                predicates.add(cb.equal(root.get("leaderId"), leaderId));
            }
            if (createdByUserId != null) {
                predicates.add(cb.equal(root.get("createdByUserId"), createdByUserId));
            }
            if (location != null && !location.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("location"), location.trim()));
            }
            if (contactMethod != null && !contactMethod.trim().isEmpty()) {
                predicates.add(cb.equal(root.get("contactMethod"), contactMethod.trim()));
            }
            if (allowDirectApply != null) {
                predicates.add(cb.equal(root.get("allowDirectApply"), allowDirectApply));
            }
            if (skill != null && !skill.trim().isEmpty()) {
                String likeSkill = "%\"" + skill.trim().toLowerCase() + "\"%";
                predicates.add(cb.like(cb.lower(root.get("skillsJson")), likeSkill));
            }
            if (keyword != null && !keyword.trim().isEmpty()) {
                String likeKeyword = "%" + keyword.trim().toLowerCase() + "%";
                Predicate keywordPredicate = cb.or(
                        cb.like(cb.lower(root.get("name")), likeKeyword),
                        cb.like(cb.lower(root.get("description")), likeKeyword),
                        cb.like(cb.lower(root.get("location")), likeKeyword),
                        cb.like(cb.lower(root.get("requirements")), likeKeyword)
                );
                predicates.add(keywordPredicate);
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return teamsRepository.findAll(spec, pageable).map(TeamsResponse::from);
    }

    @Transactional
    public TeamsResponse updateTeam(UUID teamId, TeamsUpdateRequest request) {
        log.info("팀 업데이트 요청: ID={}", teamId);
        Teams team = teamsRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("ID: " + teamId + "에 해당하는 팀을 찾을 수 없습니다."));

        TeamProfiles teamProfile = teamProfilesRepository.findByTeamId(teamId)
                .orElseThrow(() -> new IllegalArgumentException("ID: " + teamId + "에 해당하는 팀 프로필을 찾을 수 없습니다."));

        if (request.getName() != null) {
            teamsRepository.findByName(request.getName())
                    .ifPresent(existingTeam -> {
                        if (!existingTeam.getId().equals(teamId)) {
                            throw new IllegalArgumentException("이미 존재하는 팀 이름입니다: " + request.getName());
                        }
                    });
            team.setName(request.getName());
        }
        if (request.getDescription() != null) {
            team.setDescription(request.getDescription());
        }
        if (request.getLeaderId() != null) {
            team.setLeaderId(request.getLeaderId());
        }
        if (request.getContestId() != null) {
            team.setContestId(request.getContestId());
        }
        if (request.getIsRecruiting() != null) {
            team.setIsRecruiting(request.getIsRecruiting());
        }
        if (request.getIsPublic() != null) {
            team.setIsPublic(request.getIsPublic());
        }
        if (request.getMaxMembers() != null) {
            team.setMaxMembers(request.getMaxMembers());
        }
        if (request.getLocation() != null) {
            team.setLocation(request.getLocation());
        }
        if (request.getRequirements() != null) {
            team.setRequirements(request.getRequirements());
        }
        if (request.getContactMethod() != null) {
            team.setContactMethod(request.getContactMethod());
        }
        if (request.getContactInfo() != null) {
            team.setContactInfo(request.getContactInfo());
        }
        if (request.getAllowDirectApply() != null) {
            team.setAllowDirectApply(request.getAllowDirectApply());
        }

        try {
            if (request.getNeededRoles() != null) {
                team.setNeededRolesJson(objectMapper.writeValueAsString(request.getNeededRoles()));
            }
            if (request.getSkills() != null) {
                team.setSkillsJson(objectMapper.writeValueAsString(request.getSkills()));
            }
            if (request.getCategoryIds() != null) {
                team.setCategoryIdsJson(objectMapper.writeValueAsString(request.getCategoryIds()));
            }
        } catch (JsonProcessingException e) {
            log.error("팀 역할/기술/카테고리 JSON 변환 중 오류 발생: {}", e.getMessage(), e);
            throw new IllegalArgumentException("팀 역할, 기술 또는 카테고리 데이터 처리 중 오류가 발생했습니다.");
        }

        if (request.getLogoUrl() != null) {
            teamProfile.setLogoUrl(request.getLogoUrl());
        }
        if (request.getWebsiteUrl() != null) {
            teamProfile.setWebsiteUrl(request.getWebsiteUrl());
        }
        if (request.getGithubUrl() != null) {
            teamProfile.setGithubUrl(request.getGithubUrl());
        }
        if (request.getNeededRoles() != null) {
            try {
                teamProfile.setRequiredRoles(objectMapper.writeValueAsString(request.getNeededRoles()));
            } catch (JsonProcessingException e) {
                log.error("팀 역할 JSON 변환 중 오류 발생: {}", e.getMessage(), e);
                throw new IllegalArgumentException("팀 역할 데이터 처리 중 오류가 발생했습니다.");
            }
        }
        teamProfile.setUpdatedAt(LocalDateTime.now());
        teamProfilesRepository.save(teamProfile);

        Teams updatedTeam = teamsRepository.save(team);
        log.info("팀 업데이트 완료: ID={}", updatedTeam.getId());
        return TeamsResponse.from(updatedTeam);
    }

    @Transactional
    public void deactivateTeam(UUID teamId) {
        log.info("팀 ID: {} 비활성화 (모집 중지 및 비공개 처리) 시도 중.", teamId);
        Teams team = teamsRepository.findById(teamId)
                .orElseThrow(() -> new IllegalArgumentException("ID: " + teamId + "에 해당하는 팀을 찾을 수 없습니다."));

        team.setIsRecruiting(false);
        team.setIsPublic(false);
        teamsRepository.save(team);
        log.info("팀 ID: {}가 성공적으로 비활성화(모집 중지 및 비공개 처리)되었습니다.", teamId);
    }

    public boolean existsById(UUID teamId) {
        return teamsRepository.existsById(teamId);
    }
}