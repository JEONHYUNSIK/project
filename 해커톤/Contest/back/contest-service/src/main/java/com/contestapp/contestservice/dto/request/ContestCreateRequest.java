package com.contestapp.contestservice.dto.request;

import java.time.LocalDateTime;
import java.util.List; // List 타입을 사용하기 위해 추가
import java.util.stream.Collectors;

import lombok.AllArgsConstructor; // 모든 필드를 포함하는 생성자 자동 생성
import lombok.Data;          // Getter, Setter, equals, hashCode, toString 등을 자동 생성
import lombok.Getter;
import lombok.NoArgsConstructor; // 기본 생성자 자동 생성
import lombok.Setter;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContestCreateRequest {
    // 기존 공모전 생성/수정에 필요한 필드들
    private String title;
    private String description;
    private String organizer;
    private LocalDateTime startDate; // 엔티티와 동일한 필드명 및 타입
    private LocalDateTime endDate;
    private LocalDateTime registrationDeadline;
    private String prizeDescription;
    private String requirements;
    private String websiteUrl;
    private String imageUrl;
    private boolean isActive; // boolean 타입
    // private List<Long> categoryIds;  // 프론트에서 선택된 카테고리 ID 리스트
    // Contest 엔티티와 ContestService에 추가된 필드들
    private String organizerEmail;   // 주최자 이메일
    private String organizerPhone;   // 주최자 연락처
    private String submissionFormat; // 제출 형식
    private Integer maxParticipants; // 최대 참가자 수
    // JSONB 필드에 매핑될 List<String> 형태의 데이터
    private List<String> eligibility; // 참가 자격 목록
    private List<String> tags;        // 태그 목록  

    private String regionSi;
    private String regionGu;

    //----------------------------------------------------
    private List<CategoryIdDto> categoryIds;
    public List<Long> getCategoryIds() {
        return categoryIds.stream()
                         .map(CategoryIdDto::getId)
                         .collect(Collectors.toList());
    }

    @Getter
    @Setter
    public static class CategoryIdDto {
        private Long id;
    }
    //----------------------------------------------------

    

    // 참고: id, created_at, updated_at 필드는 서버에서 관리하므로 DTO에 포함하지 않습니다.
    // 만약 업데이트 시 ID가 필요하다면, ContestUpdateRequest DTO를 따로 만들고 거기에 ID를 포함하는 것이 좋습니다.
}