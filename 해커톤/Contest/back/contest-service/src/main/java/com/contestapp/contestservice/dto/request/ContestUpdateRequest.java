package com.contestapp.contestservice.dto.request;

import java.time.LocalDateTime;
import java.util.List; // List 타입을 사용하기 위해 추가

import com.contestapp.contestservice.dto.request.ContestCreateRequest.CategoryIdDto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContestUpdateRequest {
    // 기존 공모전 업데이트에 필요한 필드들
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
    private Boolean isActive; // 업데이트 시에는 null을 허용할 수 있으므로 Boolean 객체 타입이 더 유연합니다.

     // Contest 엔티티와 ContestService에 추가된 필드들
    private String organizerEmail;   // 주최자 이메일
    private String organizerPhone;   // 주최자 연락처
    private String submissionFormat; // 제출 형식
    private Integer maxParticipants; // 최대 참가자 수

    // JSONB 필드에 매핑될 List<String> 형태의 데이터
    private List<String> eligibility; // 참가 자격 목록
    private List<String> tags;        // 태그 목록

    // 카테고리 반환
    private List<CategoryIdDto> categoryIds;
    @Getter
    @Setter
    public static class CategoryIdDto {
        private Long id;
    }
    private String regionSi;
    private String regionGu;
    
}