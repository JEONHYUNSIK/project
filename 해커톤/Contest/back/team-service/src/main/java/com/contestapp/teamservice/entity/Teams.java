package com.contestapp.teamservice.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "teams", schema = "team_service")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Teams {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "leader_id", columnDefinition = "UUID")
    private UUID leaderId;

    @Column(name = "contest_id", columnDefinition = "UUID")
    private UUID contestId;

    @Column(name = "is_recruiting")
    private Boolean isRecruiting = true;

    @Column(name = "is_public")
    private Boolean isPublic = true;

    @Column(name = "max_members")
    private Integer maxMembers;

    @Column(name = "location")
    private String location;

    @Column(name = "requirements", columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "contact_method")
    private String contactMethod;

    @Column(name = "contact_info")
    private String contactInfo;

    @Column(name = "allow_direct_apply")
    private Boolean allowDirectApply = false;

    @Column(name = "category_ids_json", columnDefinition = "TEXT")
    private String categoryIdsJson;


    @Column(name = "created_by_user_id", columnDefinition = "UUID")
    private UUID createdByUserId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // 🌟🌟🌟 이 두 필드 이름을 변경해야 합니다! 🌟🌟🌟
    @Column(name = "needed_roles_json", columnDefinition = "TEXT") // eligibilityJson -> neededRolesJson
    private String neededRolesJson;

    @Column(name = "skills_json", columnDefinition = "TEXT")      // tagsJson -> skillsJson
    private String skillsJson;
    // 🌟🌟🌟 변경 완료 🌟🌟🌟


    @Builder
    public Teams(String name, String description, UUID leaderId, UUID contestId,
                 Boolean isRecruiting, Boolean isPublic, Integer maxMembers,
                 UUID createdByUserId,
                 // 🌟🌟🌟 빌더 매개변수도 변경해야 합니다! 🌟🌟🌟
                 String neededRolesJson, String skillsJson, // eligibilityJson -> neededRolesJson, tagsJson -> skillsJson
                 String location, String requirements, String contactMethod, String contactInfo,
                 Boolean allowDirectApply,
                 String categoryIdsJson) {
        this.name = name;
        this.description = description;
        this.leaderId = leaderId;
        this.contestId = contestId;
        this.isRecruiting = isRecruiting != null ? isRecruiting : true;
        this.isPublic = isPublic != null ? isPublic : true;
        this.maxMembers = maxMembers;
        this.createdByUserId = createdByUserId;
        // 🌟🌟🌟 초기화하는 필드도 변경해야 합니다! 🌟🌟🌟
        this.neededRolesJson = neededRolesJson; // this.eligibilityJson -> this.neededRolesJson
        this.skillsJson = skillsJson;           // this.tagsJson -> this.skillsJson
        // 🌟🌟🌟 변경 완료 🌟🌟🌟
        this.location = location;
        this.requirements = requirements;
        this.contactMethod = contactMethod;
        this.contactInfo = contactInfo;
        this.allowDirectApply = allowDirectApply != null ? allowDirectApply : false;
        this.categoryIdsJson = categoryIdsJson;
    }
}