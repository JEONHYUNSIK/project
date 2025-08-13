package com.contestapp.teamservice.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class TeamMemberResponse {
    private UUID userId;
    private String role;
    private Boolean is_active;
    private LocalDateTime joined_at;
}