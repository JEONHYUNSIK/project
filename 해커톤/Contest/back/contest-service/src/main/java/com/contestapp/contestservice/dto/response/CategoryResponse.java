package com.contestapp.contestservice.dto.response;

import com.contestapp.contestservice.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 카테고리 정보 응답 DTO (Data Transfer Object)
 * 
 * [역할]
 * - Category 엔티티의 정보를 클라이언트에게 전달하기 위한 객체
 * - 엔티티의 내부 구조를 숨기고 필요한 정보만 노출
 * 
 * [사용 목적]
 * 1. API 응답 데이터 표준화
 * 2. 엔티티와 외부 시스템 간의 결합도 감소
 * 3. JSON 직렬화/역직렬화를 위한 구조 제공
 * 
 * [변환 과정]
 * Category Entity → CategoryResponse DTO → JSON
 * 
 * [API 활용]
 * - GET /api/categories (카테고리 목록)
 * - GET /api/contests/{id} (대회 상세의 카테고리 정보)
 * - ContestResponse 내부에서 사용
 * 
 * [팀원 확장 가이드]
 * 1. 새 필드 추가시 from() 메서드도 함께 수정
 * 2. Jackson 어노테이션 추가로 JSON 형식 커스터마이징 가능
 * 3. 검증 어노테이션(@NotNull 등) 추가시 request DTO 별도 생성 권장
 */
@Getter  // Lombok: 모든 필드의 getter 메서드 자동 생성 (JSON 직렬화용)
@NoArgsConstructor  // Lombok: 기본 생성자 생성 (JSON 역직렬화용)
@AllArgsConstructor  // Lombok: 모든 필드를 파라미터로 받는 생성자 생성
public class CategoryResponse {
    
    /**
     * 카테고리 고유 식별자
     * 
     * [용도] 클라이언트에서 카테고리 구분을 위한 유니크 값
     * [활용] 
     * - 카테고리별 대회 필터링: GET /api/contests?category={id}
     * - 프론트엔드의 카테고리 선택 UI
     */
    private Long id;
    
    /**
     * 카테고리 이름
     * 
     * [용도] 사용자에게 표시되는 카테고리명
     * [예시] "프로그래밍", "디자인", "기획", "마케팅"
     * [활용] 카테고리 목록, 대회 상세 페이지의 태그 표시
     */
    private String name;
    
    /**
     * 카테고리 설명
     * 
     * [용도] 카테고리에 대한 상세 설명
     * [nullable] 설명이 없는 카테고리의 경우 null 가능
     * [활용] 카테고리 선택시 도움말, 툴팁 표시
     */
    private String description;

    /**
     * Category 엔티티를 CategoryResponse DTO로 변환하는 정적 팩토리 메서드
     * 
     * [설계 패턴] 정적 팩토리 메서드 패턴
     * [장점]
     * 1. 메서드명으로 의도 명확히 표현 (from)
     * 2. 객체 생성 로직 캡슐화
     * 3. null 안전성 체크 가능
     * 4. 불변 객체 생성 보장
     * 
     * [변환 과정]
     * Category Entity의 필드들을 CategoryResponse의 필드로 복사
     * 
     * [사용 예시]
     * // Service 계층에서
     * Category category = categoryRepository.findById(1L);
     * CategoryResponse response = CategoryResponse.from(category);
     * 
     * // Stream API와 함께 사용
     * List<CategoryResponse> responses = categories.stream()
     *     .map(CategoryResponse::from)
     *     .collect(Collectors.toList());
     * 
     * [null 처리]
     * - 현재는 null 체크 없음
     * - 필요시 Objects.requireNonNull() 추가 고려
     * 
     * [호출 위치]
     * - ContestResponse.from() 메서드 내부
     * - CategoryController (향후 구현 예정)
     * 
     * @param category 변환할 Category 엔티티 (null이면 NullPointerException 발생)
     * @return Category 정보가 복사된 CategoryResponse 객체
     */
    public static CategoryResponse from(Category category) {
        return new CategoryResponse(
                category.getId(),           // 카테고리 ID 복사
                category.getName(),         // 카테고리명 복사
                category.getDescription()   // 카테고리 설명 복사 (null 가능)
        );
    }
} 