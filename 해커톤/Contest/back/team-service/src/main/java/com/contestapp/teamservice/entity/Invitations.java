package com.contestapp.teamservice.entity;

import java.time.LocalDateTime;
import java.util.UUID;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist; // <-- ⭐ 이 import 문을 추가합니다.

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UpdateTimestamp;


@Entity
@Table(name = "invitations", schema = "team_service")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PUBLIC)
public class Invitations {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(name = "team_id", columnDefinition = "UUID")
    private UUID teamId;

    @Column(name = "user_id", columnDefinition = "UUID")
    private UUID userId;

    @Column(columnDefinition = "text")
    private String message;

    @Column
    private String status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    // ⭐⭐⭐ 이 @PrePersist 메서드를 추가해야 합니다. ⭐⭐⭐
    @PrePersist
    protected void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now(); // CreationTimestamp가 제대로 작동하지 않을 경우 대비
        }
        if (expiresAt == null) {
            this.expiresAt = LocalDateTime.now().plusDays(7); // 현재 시간 + 7일로 설정
        }
    }
}