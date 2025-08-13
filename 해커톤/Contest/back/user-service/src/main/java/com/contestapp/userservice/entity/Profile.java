package com.contestapp.userservice.entity;

import jakarta.persistence.*;
import java.util.UUID;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profiles", schema = "user_service")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Profile {

    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column
    private String bio;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column
    private String education;

    @Column
    private String experience;

    @Column(name = "portfolio_url")
    private String portfolioUrl;

    @Column(name = "is_public")
    private Boolean isPublic = true;

    @Builder
    public Profile(UUID id,UUID userId, String fullName, String bio,
                   String profileImageUrl, String education,
                   String experience, String portfolioUrl, Boolean isPublic) {
        this.id = id;
        this.userId = userId;
        this.fullName = fullName;
        this.bio = bio;
        this.profileImageUrl = profileImageUrl;
        this.education = education;
        this.experience = experience;
        this.portfolioUrl = portfolioUrl;
        this.isPublic = isPublic;
    }


    public void setIsPublic(Boolean isPublic) {
        this.isPublic = isPublic;
    }
    
} 