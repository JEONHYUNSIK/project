package com.contestapp.userservice.service;

import com.contestapp.userservice.dto.ProfileRequest;
import com.contestapp.userservice.entity.Profile;
import com.contestapp.userservice.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfileService {

    private final ProfileRepository profileRepository;

    /**
     * 프로필 생성/수정
     */
    @Transactional
    public void setProfile(ProfileRequest profileRequest) {
        if (profileRequest == null || profileRequest.getUserId() == null) {
            throw new IllegalArgumentException("User ID is required");
        }
        
        UUID userId = UUID.fromString(profileRequest.getUserId());
        
        // 기존 프로필이 있는지 확인g
        Profile existingProfile = profileRepository.findByUserId(userId).orElse(null);

        if (existingProfile != null) {           
            // 기존 프로필 업데이트
            updateExistingProfile(existingProfile, profileRequest);

        } else {
            
            // 새 프로필 생성
            Profile profile = Profile.builder()
                    .userId(userId)
                    .fullName(profileRequest.getFullName())
                    .bio(profileRequest.getBio())
                    .profileImageUrl(profileRequest.getProfileImageUrl())
                    .education(profileRequest.getEducation())
                    .experience(profileRequest.getExperience())
                    .portfolioUrl(profileRequest.getPortfolioUrl())
                    .build();
            
            profileRepository.save(profile);
        }
    }

    /**
     * 기존 프로필 업데이트 (불변성 유지를 위한 새 객체 생성)
     * existingProfile DB에 저장된 데이터
     * profileRequest 수정하는 데이터
     */
    private void updateExistingProfile(Profile existingProfile, ProfileRequest profileRequest) {

        Profile updatedProfile = Profile.builder()
                .id(existingProfile.getId())
                .userId(existingProfile.getUserId())
                .fullName(profileRequest.getFullName())
                .bio(profileRequest.getBio())
                .profileImageUrl(profileRequest.getProfileImageUrl())
                .education(profileRequest.getEducation())
                .experience(profileRequest.getExperience())
                .portfolioUrl(profileRequest.getPortfolioUrl())
                .isPublic(existingProfile.getIsPublic()) // 기존 공개 설정 유지
                .build();
        
        profileRepository.save(updatedProfile);
    }

    /**
     * 사용자 ID로 프로필 조회
     */
    public Profile getProfile(UUID userId) {
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for user ID: " + userId));
    }

    public Profile getProfileById(UUID userId) {
        
        if (userId == null) {
            throw new IllegalArgumentException("User ID is required");
        }

        return profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for user ID: " + userId));        
    }

    public void setProfileVisibility(UUID userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for user ID: " + userId));        

        profile.setIsPublic(!profile.getIsPublic()); // true → false or false → true
        //throw new UnsupportedOperationException("Unimplemented method 'setProfileVisibility'");
    }

    public List<Profile> getProfiles() {
        return profileRepository.findAll();     
        
    }
} 