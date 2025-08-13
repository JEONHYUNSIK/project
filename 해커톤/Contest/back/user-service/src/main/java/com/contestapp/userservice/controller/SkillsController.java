package com.contestapp.userservice.controller;

import com.contestapp.userservice.entity.Skills;
import com.contestapp.userservice.service.SkillsService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/skills")
@RequiredArgsConstructor
public class SkillsController {

    private final SkillsService skillsService;

    /**
     * 모든 기술 불러오기
     */
    @GetMapping("")
    public ResponseEntity<List<Skills>> getskills() {        
        
        List<Skills> skills = skillsService.getSkills();
        
        if (skills.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList()); // or return 204 No Content
        }
        
        return ResponseEntity.ok(skills);
    }

    // `/skills/categories` | 스킬 카테고리 목록 |
    // @GetMapping("/categories")
    // public ResponseEntity<SkillsResponse> getSkillsCatergory() {        
       
    //     Skills profile = skillsService.getSkillsCatergory();
    //     return ResponseEntity.ok(SkillsResponse.from(profile));
    // }

    // @GetMapping("/popular")
    // public ResponseEntity<SkillsResponse> getSkillsPopular() {        
       
    //     Skills profile = skillsService.getSkillsPopular();
    //     return ResponseEntity.ok(SkillsResponse.from(profile));
    // }
    
} 