package com.contestapp.userservice.controller;

import com.contestapp.userservice.dto.ProfileRequest;
import com.contestapp.userservice.dto.ProfileResponse;
import com.contestapp.userservice.entity.Profile;
import com.contestapp.userservice.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    /**
     * 프로필 조회 (현재 로그인한 사용자의 프로필)
     */
    @GetMapping("/profiles/me")
    public ResponseEntity<ProfileResponse> getMyProfile(@RequestHeader("X-User-ID") String userIdHeader) {
        
        try {
            UUID userId = UUID.fromString(userIdHeader);
            Profile profile = profileService.getProfile(userId);
            return ResponseEntity.ok(ProfileResponse.from(profile));

        } catch (IllegalArgumentException e) {
            // 유저 ID 없거나 프로필이 없는 경우
            return ResponseEntity.ok(ProfileResponse.empty()); // 또는 .noContent().build()
            
        } catch (Exception e) {
            e.printStackTrace(); // 서버 로그에 남기기
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
        
    }
    /**
     * 프로필 생성/수정 (현재 로그인한 사용자)
     */
    @PutMapping("/profiles/me")
    public ResponseEntity<String> updateMyProfile(
            @RequestHeader("X-User-ID") String userIdHeader,
            @Valid @RequestBody ProfileRequest profileRequest) {
        try {
            // 헤더의 사용자 ID를 ProfileRequest에 설정
            profileRequest.setUserId(userIdHeader);
            
            profileService.setProfile(profileRequest);
            return ResponseEntity.ok("Profile updated successfully");
        } catch (Exception e) {
            
             return ResponseEntity.ok("Profile updated fail" + e);
        }
        
    }

    /**
     * 특정 사용자의 프로필 조회 (GET 방식)
     */
    @GetMapping("/profiles/{userId}")
    public ResponseEntity<ProfileResponse> getProfileById(@PathVariable UUID userId) {
        Profile profile = profileService.getProfileById(userId);
         if (profile == null) {
            return ResponseEntity.ok(ProfileResponse.empty()); // or return 204 No Content
        }
        return ResponseEntity.ok(ProfileResponse.from(profile));
    }

     /**
     * 여러 사용자의 프로필 조회 (GET 방식)
     */
    @GetMapping("/profiles")
    public ResponseEntity<List<ProfileResponse>> getProfiles() {
        List<Profile> profiles = profileService.getProfiles();
        List<ProfileResponse> responses = profiles.stream()
                .map(ProfileResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/profiles/me/visibility")
    public ResponseEntity<String> setProfileVisibility(@PathVariable UUID userId) {        
        
        try {

            profileService.setProfileVisibility(userId);
             return ResponseEntity.ok("Profile updated successfully");

        } catch (Exception e) {

             return ResponseEntity.ok("Profile updated fail");
        }
        
       
    }
} 