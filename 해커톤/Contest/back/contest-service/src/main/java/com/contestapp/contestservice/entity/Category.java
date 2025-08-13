package com.contestapp.contestservice.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

/**
 * 대회 카테고리 엔티티
 * 
 * [역할]
 * - 대회 분류를 위한 카테고리 정보 저장
 * - Contest와 Many-to-Many 관계로 연결
 * 
 * [데이터베이스 매핑]
 * - 테이블명: contest_service.categories
 * - 기본키: id (IDENTITY 전략으로 자동 증가)
 * 
 * [연관관계]
 * - Contest와 @ManyToMany (하나의 카테고리에 여러 대회, 하나의 대회에 여러 카테고리)
 * - 중간 테이블: contest_categories (Contest.java에서 정의)
 * 
 * [팀원 확장 가이드]
 * 1. 새 필드 추가시 @Column 어노테이션과 Builder 패턴에 포함 필요
 * 2. 카테고리 활성화/비활성화 기능 추가 예정 (isActive 필드)
 * 3. 카테고리 정렬 순서 기능 추가 예정 (displayOrder 필드)
 */
@Entity
@Table(name = "categories", schema = "contest_service")  // contest_service 스키마의 categories 테이블 매핑
@Getter  // Lombok: 모든 필드의 getter 메서드 자동 생성
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)  // JPA용 기본 생성자 (외부 접근 제한)
public class Category {

    /**
     * 카테고리 고유 식별자
     * 
     * [설정]
     * - IDENTITY 전략: 데이터베이스의 AUTO_INCREMENT 사용
     * - PostgreSQL의 SERIAL 타입과 매핑
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 카테고리 이름
     * 
     * [제약조건]
     * - NOT NULL: 필수 입력 필드
     * - UNIQUE: 중복된 카테고리명 방지
     * 
     * [예시] "프로그래밍", "디자인", "기획", "마케팅"
     */
    @Column(nullable = false, unique = true)
    private String name;

    /**
     * 카테고리 설명
     * 
     * [설정]
     * - TEXT 타입: 긴 텍스트 저장 가능
     * - nullable: 설명이 없어도 카테고리 생성 가능
     * 
     * [용도] 사용자에게 카테고리의 상세 설명 제공
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * 이 카테고리에 속한 대회 목록
     * 
     * [연관관계 설정]
     * - @ManyToMany: 다대다 관계
     * - mappedBy = "categories": Contest.categories 필드가 연관관계 주인
     * - 지연 로딩: 카테고리 조회시 대회 목록은 필요할 때만 로드
     * 
     * [주의사항]
     * - 양방향 연관관계이므로 Contest 쪽에서 관리
     * - 카테고리 삭제시 연관된 대회와의 관계 처리 필요
     */
    @ManyToMany(mappedBy = "categories")
    private List<Contest> contests = new ArrayList<>();

    /**
     * Category 빌더 생성자
     * 
     * [Builder 패턴 사용 이유]
     * 1. 필수 필드(name)와 선택 필드(description) 구분
     * 2. 가독성 향상: Category.builder().name("프로그래밍").description("...").build()
     * 3. 불변 객체 생성: 생성 후 값 변경 불가
     * 
     * [사용 예시]
     * Category category = Category.builder()
     *     .name("프로그래밍")
     *     .description("알고리즘, 개발 관련 대회")
     *     .build();
     * 
     * @param name 카테고리명 (필수)
     * @param description 카테고리 설명 (선택)
     */
    @Builder
    public Category(String name, String description) {
        this.name = name;
        this.description = description;
    }
} 