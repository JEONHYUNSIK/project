package com.contestapp.contestservice.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.contestapp.contestservice.entity.FavoritesEntity;

@Repository
public interface FavoritesRepository extends JpaRepository<FavoritesEntity, UUID> {
    // 사용자 별 즐겨찾기
    List<FavoritesEntity> findByUserId(UUID userId);
    // 즐겨찾기 삭제
    // void deleteByUserIdAndContestId(UUID userId, UUID contestId);
    @Modifying
    @Transactional
    @Query("DELETE FROM FavoritesEntity f WHERE f.userId = :userId AND f.contestId = :contestId")
    void deleteByUserIdAndContestId(@Param("userId") UUID userId, @Param("contestId") UUID contestId);
    boolean existsByUserIdAndContestId(UUID userId, UUID contestId);
    int countByContestId(UUID contestId);
}