package com.contestapp.teamservice.dto.response;

import com.contestapp.teamservice.entity.ApplicationEntity;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Getter
@Setter
public class ApplicationResponse {
    private UUID id;
    private UUID teamId;
    private UUID userId;
    private String message;
    private String status;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;

    public static ApplicationResponse fromEntity(ApplicationEntity entity) {
        ApplicationResponse response = new ApplicationResponse();
        response.setId(entity.getId());
        response.setTeamId(entity.getTeamId());
        response.setUserId(entity.getUserId());
        response.setMessage(entity.getMessage());
        response.setStatus(entity.getStatus());
        response.setCreatedAt(entity.getCreatedAt());
        response.setUpdatedAt(entity.getUpdatedAt());
        return response;
    }
}
