// src/main/java/com/contestapp/teamservice/repository/TeamsRepository.java
package com.contestapp.teamservice.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.contestapp.teamservice.entity.Teams;

@Repository
public interface TeamsRepository extends JpaRepository<Teams, UUID>, JpaSpecificationExecutor<Teams> {

    Optional<Teams> findByName(String name);

    Page<Teams> findByContestId(UUID contestId, Pageable pageable);

    Page<Teams> findByLeaderId(UUID leaderId, Pageable pageable);

    Page<Teams> findByCreatedByUserId(UUID createdByUserId, Pageable pageable);

    Page<Teams> findByIsRecruiting(Boolean isRecruiting, Pageable pageable);

    Page<Teams> findByIsPublic(Boolean isPublic, Pageable pageable);

    /**
     * 키워드로 팀 검색 (팀 이름, 설명, 활동 지역, 요구사항 대상)
     *
     * [목적] 사용자가 입력한 키워드로 팀 검색
     * [검색 대상 필드] name (팀 이름), description (팀 설명), location (활동 지역), requirements (요구사항)
     * [검색 특징] 대소문자 구분 없음, 부분 일치, OR 조건
     * @param keyword 검색할 키워드
     * @param pageable 페이징 정보
     * @return 키워드가 포함된 팀 목록
     */
    @Query("SELECT t FROM Teams t WHERE " +
            "LOWER(t.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(t.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(t.location) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " + // 👈 location 필드 추가
            "LOWER(t.requirements) LIKE LOWER(CONCAT('%', :keyword, '%'))") // 👈 requirements 필드 추가
    Page<Teams> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // 새롭게 추가된 필드들에 대한 특정 검색 메서드가 필요하다면 아래와 같이 추가할 수 있습니다.
    // 예: 특정 활동 지역의 팀 검색
    Page<Teams> findByLocation(String location, Pageable pageable);

    // 예: 특정 연락 방법을 사용하는 팀 검색
    Page<Teams> findByContactMethod(String contactMethod, Pageable pageable);

    // findByIdWithCategories 및 findByCategoriesContaining 주석 처리 유지 (Category 엔티티 매핑 문제)
}