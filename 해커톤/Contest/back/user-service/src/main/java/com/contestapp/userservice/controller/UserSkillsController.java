package com.contestapp.userservice.controller;

import com.contestapp.userservice.dto.UserSkillsRequest;
import com.contestapp.userservice.dto.UserSkillsResponse;
import com.contestapp.userservice.entity.UserSkills;
import com.contestapp.userservice.service.UserSkillsService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserSkillsController {

    private final UserSkillsService userSkillsService;

    // 현재 로그인한 사용자의 기술 목록 조회
    @GetMapping("/me/skills")
    public ResponseEntity<List<UserSkillsResponse>> getUserSkills(@RequestHeader("X-User-ID") String userIdHeader) {
        UUID id = UUID.fromString(userIdHeader);
        List<UserSkills> userSkills = userSkillsService.getUserSkills(id);
        return ResponseEntity.ok(UserSkillsResponse.from(userSkills));
    }

    // 현재 로그인한 사용자의 기술 목록 수정
    @PutMapping("/me/skills")
    public ResponseEntity<String> setUserSkills(@RequestBody UserSkillsRequest userSkillsRequest) {
       
        if (userSkillsRequest.getUserId() == null || userSkillsRequest.getSkills() == null) {
            return ResponseEntity.badRequest().body("Invalid request data");
        }


        userSkillsService.addSkillsToUser(userSkillsRequest);
        return ResponseEntity.ok("skills updated successfully");
    }

    // 모든 사용자의 기술 목록 조회
    @GetMapping("/skills")
    public ResponseEntity<List<UserSkillsResponse>> getAllUserSkills() {
        List<UserSkills> userSkills = userSkillsService.getAllUserSkills();
        return ResponseEntity.ok(UserSkillsResponse.from(userSkills));
    }
    
} 