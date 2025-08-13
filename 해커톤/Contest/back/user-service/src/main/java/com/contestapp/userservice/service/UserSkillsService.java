package com.contestapp.userservice.service;


import com.contestapp.userservice.dto.UserSkillsRequest;
import com.contestapp.userservice.dto.UserSkillsRequest.SkillProficiency;
import com.contestapp.userservice.entity.UserSkills;
import com.contestapp.userservice.repository.UserSkillsRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserSkillsService {

    private final UserSkillsRepository userSkillsRepository;

    /*사용자가 등록한 모든 스킬 정보 가져오기 */
    public List<UserSkills> getUserSkills(UUID userId) {

        return userSkillsRepository.findByUserId(userId);
    
    }

    /**
     * 사용자 스킬 등록
     * @param request
     */
    @Transactional
    public void addSkillsToUser(UserSkillsRequest request) {

        if (request == null || request.getUserId() == null || request.getSkills() == null) {
            throw new IllegalArgumentException("Invalid request data");
        }
        
        // 기존 스킬 삭제
        userSkillsRepository.deleteAllByUserId(request.getUserId());

        for (SkillProficiency sp : request.getSkills()) {
            // 이미 등록된 스킬인지 확인
            // 만약 등록되어 있지 않다면 새로 등록
            if (!userSkillsRepository.existsByUserIdAndSkillId(request.getUserId(), sp.getSkillId())) {

                UserSkills userSkills = new UserSkills( 
                    request.getUserId(),
                    sp.getSkillId(),
                    sp.getProficiency()
                );
                
                userSkillsRepository.save(userSkills);
            }
        }
    }   

    /**
     * 모든 사용자 스킬 조회
     */

    public List<UserSkills> getAllUserSkills() {
        return userSkillsRepository.findAll();
    }
} 