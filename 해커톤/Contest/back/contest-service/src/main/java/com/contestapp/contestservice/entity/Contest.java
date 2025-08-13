package com.contestapp.contestservice.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID; // UUID 타입 사용을 위해 추가

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.JdbcTypeCode; // Hibernate 6+에서 JSON 타입을 위해 추가
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes; // Hibernate 6+에서 JSON 타입을 위해 추가

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 대회 정보 엔티티
 *
 * [역할]
 * - 대회의 모든 정보를 저장하는 핵심 엔티티
 * - 카테고리, 즐겨찾기, 참가신청과 연관관계 설정
 *
 * [데이터베이스 매핑]
 * - 테이블명: contest_service.contests
 * - 기본키: UUID 타입 (분산 환경에서 유니크 보장)
 *
 * [연관관계]
 * - Category와 @ManyToMany (하나의 대회가 여러 카테고리에 속할 수 있음)
 * - Favorite과 @OneToMany (향후 추가 예정)
 * - Participation과 @OneToMany (향후 추가 예정)
 * - User 정보는 ID만 저장하고, 필요 시 user-service API 호출
 *
 * [확장 예정 기능]
 * 1. 즐겨찾기 기능 (Favorite 엔티티 연동)
 * 2. 참가 신청 기능 (Participation 엔티티 연동)
 * 3. 대회 상태 관리 (DRAFT, ONGOING, FINISHED 등)
 */
@Entity
@Table(name = "contests", schema = "contest_service")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)

public class Contest {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String organizer;

    // --- ContestCreateRequest DTO에 추가된 필드들 ---
    @Column(name = "organizer_email")
    private String organizerEmail;

    @Column(name = "organizer_phone")
    private String organizerPhone;

    @Column(name = "submission_format", columnDefinition = "TEXT")
    private String submissionFormat;

    @Column(name = "max_participants")
    private Integer maxParticipants;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "eligibility_json", columnDefinition = "jsonb")
    private String eligibilityJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "tags_json", columnDefinition = "jsonb")
    private String tagsJson;
    // --- 추가된 필드 끝 ---

    @Column(name = "start_date", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "end_date", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "registration_deadline")
    private LocalDateTime registrationDeadline;

    @Column(name = "prize_description", columnDefinition = "TEXT")
    private String prizeDescription;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "website_url")
    private String websiteUrl;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "is_active")
    private Boolean isActive = true;

    @ManyToMany
    @JoinTable(
        name = "contest_categories",
        schema = "contest_service",
        joinColumns = @JoinColumn(name = "contest_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private List<Category> categories = new ArrayList<>();

    // --- 공모전 생성 사용자 ID (User 객체 대신 ID만 저장) ---
    // User 엔티티를 직접 참조하지 않으므로 'import com.contestapp.userservice.entity.User;'는 필요 없습니다.
    @Column(name = "created_by_user_id", columnDefinition = "UUID") // DB 컬럼 타입에 맞게 설정 (예: UUID 또는 bigint)
    private UUID createdByUserId; // User의 ID가 UUID인 경우, Long이면 private Long createdByUserId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    /**
     * Contest 빌더 생성자
     * User 객체 대신 createdByUserId (UUID)를 받습니다.
     */


    //--------------------------수경--------------------------
    // @컬럼을 안해서, 실질적인 열에 영향을 미치진 않음.
    @Enumerated(EnumType.STRING)
    private ContestStatus status;

    @Column(name = "region_si")
    private String regionSi;

    @Column(name = "region_gu")
    private String regionGu;

    //--------------------------수경--------------------------

    @Builder
    public Contest(String title, String description, String organizer,
                   String organizerEmail, String organizerPhone,
                   String submissionFormat, Integer maxParticipants,
                   LocalDateTime startDate, LocalDateTime endDate, LocalDateTime registrationDeadline,
                   String prizeDescription, String requirements, String websiteUrl, String imageUrl,
                   Boolean isActive,List<Category> categories,
                   String eligibilityJson, String tagsJson,
                   UUID createdByUserId, ContestStatus status, String regionSi, String regionGu // <-- User 객체 대신 UUID 타입의 사용자 ID를 받도록 변경,
                  
                   ) {
        this.title = title;
        this.description = description;
        this.organizer = organizer;
        this.organizerEmail = organizerEmail;
        this.organizerPhone = organizerPhone;
        this.submissionFormat = submissionFormat;
        this.maxParticipants = maxParticipants;
        this.startDate = startDate;
        this.endDate = endDate;
        this.registrationDeadline = registrationDeadline;
        this.prizeDescription = prizeDescription;
        this.requirements = requirements;
        this.websiteUrl = websiteUrl;
        this.imageUrl = imageUrl;
        this.isActive = isActive != null ? isActive : true;
        this.categories = categories != null ? categories : new ArrayList<>();  // null이면 빈 리스트 설정
        this.eligibilityJson = eligibilityJson;
        this.tagsJson = tagsJson;
        this.createdByUserId = createdByUserId; // 사용자 ID 설정
        this.status = status;
        this.regionSi = regionSi;
        this.regionGu = regionGu;
    }

    
}

