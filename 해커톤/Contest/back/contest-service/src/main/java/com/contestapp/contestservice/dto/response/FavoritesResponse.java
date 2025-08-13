package com.contestapp.contestservice.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.UUID;

import com.contestapp.contestservice.entity.Contest;

@Getter
@Builder
public class FavoritesResponse {
    private UUID id;
    private String title;
    private String organizer;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

        public static FavoritesResponse fromEntity(Contest contest) {
        return FavoritesResponse.builder()
            .id(contest.getId())
            .title(contest.getTitle())
            .organizer(contest.getOrganizer())
            .startDate(contest.getStartDate())
            .endDate(contest.getEndDate())
            .build();
    }
}
