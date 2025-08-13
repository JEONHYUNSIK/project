package com.contestapp.contestservice.dto.response;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.contestapp.contestservice.entity.Contest;
import com.contestapp.contestservice.entity.ContestStatus;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.Builder;

/**
 * 대회 정보 응답 DTO (Data Transfer Object)
 *
 * [역할]
 * - Contest 엔티티의 모든 정보를 클라이언트에게 전달하기 위한 객체
 * - 연관된 카테고리 정보, 로그인 사용자 관련 정보 포함
 *
 * [사용 목적]
 * 1. 대회 목록/상세 API의 표준 응답 형식
 * 2. 엔티티 내부 구조 숨김 및 필요한 정보만 노출
 * 3. JSON 직렬화를 통한 RESTful API 응답
 *
 * [변환 과정]
 * Contest Entity + Categories → ContestResponse DTO → JSON
 *
 * [API 활용 상황]
 * - GET /api/contests (대회 목록 - 페이징 포함)
 * - GET /api/contests/{id} (대회 상세 조회)
 * - 로그인 여부에 따라 즐겨찾기, 작성자 여부 필드 추가
 *
 * [팀원 확장 가이드]
 * 1. 새 필드 추가시 fromEntity() 메서드 수정
 * 2. 조건부 표시 필드는 fromEntity() 오버로딩 메서드에 추가
 */
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContestResponse {
    
    private UUID id;
    private String title;
    private String description;
    private String organizer;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime registrationDeadline;
    private String prizeDescription;
    private String requirements;
    private String websiteUrl;
    private String imageUrl;
    private Boolean isActive;
    private List<CategoryResponse> categories;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private ContestStatus status;
    private String organizerEmail;
    private String organizerPhone;
    private String submissionFormat;
    private Integer maxParticipants;
    private List<String> eligibility;
    private List<String> tags;
    private UUID createdByUserId;
    private String regionSi;
    private String regionGu;

    // 로그인 사용자 전용 필드
    private boolean isLiked;
    private boolean isAuthor;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Contest 엔티티를 ContestResponse DTO로 변환하는 정적 팩토리 메서드.
     * 비로그인 사용자를 위한 메서드.
     *
     * @param contest 변환할 Contest 엔티티
     * @return 변환된 ContestResponse DTO
     */
    public static ContestResponse fromEntity(Contest contest) {
        return fromEntity(contest, false, false);
    }
    
    /**
     * Contest 엔티티를 ContestResponse DTO로 변환하는 정적 팩토리 메서드.
     * 기존 코드와의 호환성을 위해 추가.
     *
     * @param contest 변환할 Contest 엔티티
     * @return 변환된 ContestResponse DTO
     */
    public static ContestResponse from(Contest contest) {
        return fromEntity(contest);
    }


    /**
     * Contest 엔티티를 ContestResponse DTO로 변환하는 정적 팩토리 메서드.
     * 로그인 사용자를 위한 메서드로, 좋아요 여부와 작성자 여부를 포함합니다.
     *
     * @param contest 변환할 Contest 엔티티
     * @param isLiked 사용자의 좋아요 여부
     * @param isAuthor 사용자의 작성자 여부
     * @return 변환된 ContestResponse DTO
     */
    public static ContestResponse fromEntity(Contest contest, boolean isLiked, boolean isAuthor) {
        List<String> eligibilityList = Collections.emptyList();
        List<String> tagsList = Collections.emptyList();

        try {
            if (contest.getEligibilityJson() != null && !contest.getEligibilityJson().isEmpty()) {
                eligibilityList = objectMapper.readValue(contest.getEligibilityJson(), new TypeReference<List<String>>() {});
            }
            if (contest.getTagsJson() != null && !contest.getTagsJson().isEmpty()) {
                tagsList = objectMapper.readValue(contest.getTagsJson(), new TypeReference<List<String>>() {});
            }
        } catch (JsonProcessingException e) {
            System.err.println("JSON 파싱 오류: " + e.getMessage());
        }
        
        List<CategoryResponse> categoryResponses = contest.getCategories().stream()
                .map(CategoryResponse::from)
                .collect(Collectors.toList());

        return ContestResponse.builder()
                .id(contest.getId())
                .title(contest.getTitle())
                .description(contest.getDescription())
                .organizer(contest.getOrganizer())
                .startDate(contest.getStartDate())
                .endDate(contest.getEndDate())
                .registrationDeadline(contest.getRegistrationDeadline())
                .prizeDescription(contest.getPrizeDescription())
                .requirements(contest.getRequirements())
                .websiteUrl(contest.getWebsiteUrl())
                .imageUrl(contest.getImageUrl())
                .isActive(contest.getIsActive())
                .createdAt(contest.getCreatedAt())
                .updatedAt(contest.getUpdatedAt())
                .status(contest.getStatus())
                .organizerEmail(contest.getOrganizerEmail())
                .organizerPhone(contest.getOrganizerPhone())
                .submissionFormat(contest.getSubmissionFormat())
                .maxParticipants(contest.getMaxParticipants())
                .eligibility(eligibilityList)
                .tags(tagsList)
                .createdByUserId(contest.getCreatedByUserId())
                .regionSi(contest.getRegionSi())
                .regionGu(contest.getRegionGu())
                .isLiked(isLiked)
                .isAuthor(isAuthor)
                .categories(categoryResponses)
                .build();
    }
}