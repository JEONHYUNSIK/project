package com.contestapp.userservice.dto;

import java.util.UUID;

import com.contestapp.userservice.entity.Profile;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ProfileResponse {
    private UUID userId;
    private String fullName;
    private String bio;
    private String profileImageUrl;
    private String education;
    private String experience;
    private String portfolioUrl;

    // 생성자 추가
    public ProfileResponse(String fullName, String bio,
                           String profileImageUrl, String education, String experience) {
        //this.userId = userId;
        this.fullName = fullName;
        this.bio = bio;
        this.profileImageUrl = profileImageUrl;
        this.education = education;
        this.experience = experience;
    }

    public static ProfileResponse from(Profile profile) {
        if (profile == null) {
            return empty();
        }

        return new ProfileResponse(
                profile.getUserId(),                
                profile.getFullName(),
                profile.getBio(),
                profile.getProfileImageUrl(),
                profile.getEducation(),
                profile.getExperience(),
                profile.getPortfolioUrl()
        );
    }

    public static ProfileResponse empty() {
        return new ProfileResponse(null, "", "", "", "", "", ""); // 모든 필드를 기본값으로
    }
} 