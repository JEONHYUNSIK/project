package com.contestapp.teamservice.dto.request;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Builder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamsUpdateRequest {

    private String name;
    private String description;
    private UUID leaderId;
    private UUID contestId;
    private Boolean isRecruiting;
    private Boolean isPublic;
    private Integer maxMembers;

    private List<String> neededRoles; // 모집하는 역할 (프론트엔드의 neededRoles와 일치)
    private List<String> skills;      // 필요한 기술 스택 (프론트엔드의 skills와 일치)

    private String location;
    private String requirements;
    private String contactMethod;
    private String contactInfo;

    private Boolean allowDirectApply; // 다이렉트 지원 허용 여부

    private List<UUID> categoryIds; // 관련 대회 카테고리 ID 목록

    // 🌟🌟🌟 아래에 team_profiles 테이블 관련 필드를 추가합니다. 🌟🌟🌟
    private String logoUrl;
    private String websiteUrl;
    private String githubUrl;
    // 🌟🌟🌟 추가 완료 🌟🌟🌟
}