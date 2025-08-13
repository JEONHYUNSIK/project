package com.contestapp.teamservice.dto.request;

import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamsCreateRequest {

    private String name;        // 팀 이름
    private String description;    // 팀 설명
    private UUID leaderId;        // 팀 리더의 ID
    private UUID contestId;        // 대회 ID
    private Boolean isRecruiting;    // 모집 여부 (현재 프론트엔드에서 status로 보냄)
    private Boolean isPublic;        // 공개 여부
    private Integer maxMembers;    // 최대 팀원 수
    private UUID createdByUserId;    // 팀 생성 사용자 ID

    private List<String> neededRoles; // 프론트엔드의 neededRoles와 일치
    private List<String> skills;      // 프론트엔드의 skills와 일치

    private String location;        // 팀 활동 지역 (예: "온라인", "서울")
    private String requirements;    // 팀원 모집 상세 요구사항
    private String contactMethod;    // 연락 방법 (예: "email", "kakao", "platform")
    private String contactInfo;     // 연락처 정보 (이메일 주소, 카카오톡 오픈채팅 링크 등)

    private Boolean allowDirectApply; // 다이렉트 지원 허용 여부

    private List<UUID> categoryIds; // Category 엔티티의 ID 타입이 UUID라고 가정
    
    // 🌟🌟🌟 아래에 TeamProfiles 테이블 관련 필드를 추가합니다. 🌟🌟🌟
    private String logoUrl;
    private String websiteUrl;
    private String githubUrl;
    // 🌟🌟🌟 추가 완료 🌟🌟🌟
}