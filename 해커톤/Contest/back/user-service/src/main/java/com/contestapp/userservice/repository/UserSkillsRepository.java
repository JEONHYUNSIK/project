package com.contestapp.userservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.contestapp.userservice.entity.UserSkills;

import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

public interface UserSkillsRepository extends JpaRepository<UserSkills, UUID> {
    /**
     * 사용자 ID와 스킬 ID로 UserSkills 존재 여부 확인
     * @param userId 사용자 ID
     * @param skillId 스킬 ID
     * @return 존재 여부
     */
    boolean existsByUserIdAndSkillId(UUID userId, int skillId);

    /**
     * 사용자 ID로 UserSkills 목록 조회
     * @param userId 사용자 ID
     * @return UserSkills 목록
     */
    List<UserSkills> findByUserId(UUID userId);

    // /**
    //  * 모든 UserSkills ID 조회
    //  * @return UserSkills ID 목록
    //  */
    // List<UserSkills> findByAllUserSkillsId();

    /**
     * 사용자 ID로 UserSkills 삭제
     * @param userId 사용자 ID
     */
    void deleteAllByUserId(UUID userId);

} 