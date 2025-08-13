package com.contestapp.userservice.service;
import com.contestapp.userservice.entity.Skills;

import com.contestapp.userservice.repository.SkillsRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SkillsService {

    private final SkillsRepository skillsRepository;

    /**
     * 스킬 조회
     */
    public Skills getSkills(int id) {
        if (id < 0) {
            throw new IllegalArgumentException("User ID is required");
        }

        return skillsRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Profile not found for user ID: " + id));
    }
    
    /**
     * 모든 스킬 조회
     */

    public List<Skills> getSkills() {

        return skillsRepository.findAll();
              
    }

    /**
     * 스킬 카테고리 및 인기 스킬 조회
     * 현재는 구현되지 않았으므로 예외를 던짐
     */
    public Skills getSkillsCatergory() {

        throw new UnsupportedOperationException("Unimplemented method 'getSkillsCatergory'");
    }

    /**
     * 인기 스킬 조회
     * 현재는 구현되지 않았으므로 예외를 던짐
     */
    public Skills getSkillsPopular() {

        throw new UnsupportedOperationException("Unimplemented method 'getSkillsPopular'");
    }
} 