    package com.contestapp.contestservice.controller;

    import com.contestapp.contestservice.entity.FavoritesEntity;
    import com.contestapp.contestservice.service.FavoritesService;
    import lombok.RequiredArgsConstructor;
    import org.springframework.http.ResponseEntity;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;
    import java.util.UUID;

    @RestController
    @RequestMapping("/api/contests/favorite")
    @RequiredArgsConstructor
    public class FavoritesController {

        private final FavoritesService favoritesService;

        /**
         * 즐겨찾기 추가
         * 예: POST /api/favorites?user_id={userId}&contest_id={contestId}
         */
            @PostMapping("/{contestId}/favoritesAdd")
        public ResponseEntity<Void> addFavorite(
            @PathVariable UUID contestId,
            @RequestHeader("X-USER-ID") UUID userId
        ) {
            favoritesService.addFavorite(userId, contestId);
            return ResponseEntity.ok().build();
        }

        /**
         * 사용자별 즐겨찾기 목록 조회
         * 예: GET /api/favorites?user_id={userId}
         */
        @GetMapping("/favoritesList")
        public ResponseEntity<List<FavoritesEntity>> getFavoritesByUser(
            @RequestHeader("X-USER-ID") UUID userId
        ) {
            List<FavoritesEntity> favorites = favoritesService.getFavoritesByUserId(userId);
            return ResponseEntity.ok(favorites);
        }

        // 즐겨찾기 여부
        @GetMapping("/{contestId}/isfavorites")
        public ResponseEntity<Boolean> getMethodName(
            @RequestHeader("X-USER-ID") UUID userId, 
            @PathVariable UUID contestId
            ) {
            boolean isFavorited = favoritesService.isFavorite(userId, contestId);
            return ResponseEntity.ok(isFavorited);
        }

        //즐겨찾기 삭제
        @DeleteMapping("/{contestId}/favoritesRemove")
        public ResponseEntity<Void> removeFavorite(
        @PathVariable UUID contestId,
        @RequestHeader("X-USER-ID") UUID userId
        ) {
        favoritesService.removeFavorite(userId, contestId);
        return ResponseEntity.noContent().build();
        }
        
        // 콘테스트 별 즐겨찾기 횟수
        @GetMapping("/{contestId}/favoritesCount")
        public ResponseEntity<Integer> getFavoritesCount(@PathVariable UUID contestId) {
        int count = favoritesService.countFavoritesByContestId(contestId);
        return ResponseEntity.ok(count);
        }
    }
