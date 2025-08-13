package com.contestapp.contestservice.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.contestapp.contestservice.dto.response.FavoritesResponse;
import com.contestapp.contestservice.service.FavoritesService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mypage")
@RequiredArgsConstructor
public class MypageController {

    private final FavoritesService favoritesService;

    @GetMapping("/favorites")
    public ResponseEntity<List<FavoritesResponse>> getFavoriteContests(
        @RequestHeader("X-USER-ID") UUID userId
    ) {
        List<FavoritesResponse> favoriteContests = favoritesService.getFavoriteContestsWithInfo(userId);
        return ResponseEntity.ok(favoriteContests);
    }
}