package com.contestapp.contestservice.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * 즐겨찾기(Favorite) 엔티티
 *
 * [역할]
 * - 사용자가 특정 대회를 즐겨찾기한 기록을 저장
 *
 * [데이터베이스 매핑]
 * - 테이블명: contest_service.favorites
 * - 기본키: UUID
 */
@Entity
@Table(
    name = "favorites",
    schema = "contest_service"
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class FavoritesEntity {

    /**
     * 즐겨찾기 고유 식별자
     */
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "UUID")
    private UUID id;

    /**
     * 사용자 ID
     */
    @Column(name = "user_id", columnDefinition = "UUID", nullable = false)
    private UUID userId;

    /**
     * 공모전 ID
     */
    @Column(name = "contest_id", columnDefinition = "UUID", nullable = false)
    private UUID contestId;

    /**
     * 즐겨찾기 등록 일시
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * 엔티티 생성 시 자동으로 등록 시간 설정
     */
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    /**
     * 생성자
     * 
     * @param userId 사용자 ID
     * @param contestId 공모전 ID
     */
    public FavoritesEntity(UUID userId, UUID contestId) {
        this.userId = userId;
        this.contestId = contestId;
    }
}