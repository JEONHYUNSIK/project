package com.contestapp.contestservice.service;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.contestapp.contestservice.dto.response.FavoritesResponse;
import com.contestapp.contestservice.entity.Contest;
import com.contestapp.contestservice.entity.FavoritesEntity;
import com.contestapp.contestservice.repository.ContestRepository;
import com.contestapp.contestservice.repository.FavoritesRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FavoritesService {

    private final FavoritesRepository favoritesRepository;
    private final ContestRepository contestRepository;

    // 즐겨찾기 추가
    public FavoritesEntity addFavorite(UUID userId, UUID contestId) {
        FavoritesEntity favorite = new FavoritesEntity(userId, contestId);
        return favoritesRepository.save(favorite);
    }

    // 사용자별 즐겨찾기 리스트 조회 (엔티티 리스트)
    public List<FavoritesEntity> getFavoritesByUserId(UUID userId) {
        return favoritesRepository.findByUserId(userId);
    }

    // 즐겨찾기 삭제
    @Transactional
    public void removeFavorite(UUID userId, UUID contestId) {
        favoritesRepository.deleteByUserIdAndContestId(userId, contestId);
    }

    // 즐겨찾기 여부 확인
    public boolean isFavorite(UUID userId, UUID contestId) {
        return favoritesRepository.existsByUserIdAndContestId(userId, contestId);
    }

    // 콘테스트 별 즐겨찾기 횟수 조회
    public int countFavoritesByContestId(UUID contestId) {
        return favoritesRepository.countByContestId(contestId);
    }

    // 사용자별 즐겨찾기된 콘테스트 정보 조회 (DTO 변환 포함)
    public List<FavoritesResponse> getFavoriteContestsWithInfo(UUID userId) {
        List<FavoritesEntity> favorites = favoritesRepository.findByUserId(userId);

        List<UUID> contestIds = favorites.stream()
                .map(FavoritesEntity::getContestId)
                .toList();

        List<Contest> contests = contestRepository.findAllById(contestIds);

        return contests.stream()
                .map(FavoritesResponse::fromEntity)
                .toList();
    }
}