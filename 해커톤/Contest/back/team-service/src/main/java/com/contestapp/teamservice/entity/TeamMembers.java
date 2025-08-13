package com.contestapp.teamservice.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity // 이 클래스를 JPA 엔티티로 지정합니다.
@Table(name = "team_members") // 이 엔티티가 매핑될 테이블 이름을 지정합니다.
@Getter // Lombok을 사용하여 모든 필드의 Getter 메서드를 자동 생성합니다.
@Setter // Lombok을 사용하여 모든 필드의 Setter 메서드를 자동 생성합니다.
@NoArgsConstructor // Lombok을 사용하여 인자 없는 기본 생성자를 자동 생성합니다.
public class TeamMembers {

    @Id // 이 필드를 테이블의 기본 키(Primary Key)로 지정합니다.
    @GeneratedValue(strategy = GenerationType.AUTO) // ID가 자동으로 생성되도록 설정합니다.
    private UUID id;

    @Column(name = "team_id", nullable = false) // team_id 컬럼에 매핑됩니다.
    private UUID teamId;

    @Column(name = "user_id", nullable = false) // user_id 컬럼에 매핑됩니다.
    private UUID userId;

    @Column(name = "role", nullable = false, length = 50) // role 컬럼에 매핑됩니다.
    private String role;

    @Column(name = "joined_at", nullable = false) // joined_at 컬럼에 매핑됩니다.
    private LocalDateTime joinedAt;

    @Column(name = "is_active", nullable = false) // is_active 컬럼에 매핑됩니다.
    private boolean isActive;
}