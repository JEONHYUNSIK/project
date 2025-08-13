// C:\Contest\back\team-service\src\main\java\com\contestapp\teamservice\dto\response\TeamsResponse.java
package com.contestapp.teamservice.dto.response;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import com.contestapp.teamservice.entity.Teams;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class TeamsResponse {

    private UUID id;
    private String name;
    private String description;
    private UUID leaderId;
    private UUID contestId;
    private Boolean isRecruiting;
    private Boolean isPublic;
    private Integer maxMembers;
    private UUID createdByUserId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<String> neededRoles;
    private List<String> skills;
    private List<UUID> categoryIds;

    private String location;
    private String requirements;
    private String contactMethod;
    private String contactInfo;

    private Boolean allowDirectApply;

    private static final ObjectMapper objectMapper = new ObjectMapper();

    public static TeamsResponse from(Teams teams) {
        List<String> neededRolesList = Collections.emptyList();
        List<String> skillsList = Collections.emptyList();
        List<UUID> categoryIdsList = Collections.emptyList();

        if (teams.getNeededRolesJson() != null && !teams.getNeededRolesJson().isEmpty()) {
            try {
                neededRolesList = objectMapper.readValue(teams.getNeededRolesJson(), new TypeReference<List<String>>() {});
            } catch (JsonProcessingException e) {
                System.err.println("Error parsing neededRoles JSON for Team ID " + teams.getId() + ": " + e.getMessage());
            }
        }

        if (teams.getSkillsJson() != null && !teams.getSkillsJson().isEmpty()) {
            try {
                skillsList = objectMapper.readValue(teams.getSkillsJson(), new TypeReference<List<String>>() {});
            } catch (JsonProcessingException e) {
                System.err.println("Error parsing skills JSON for Team ID " + teams.getId() + ": " + e.getMessage());
            }
        }

        if (teams.getCategoryIdsJson() != null && !teams.getCategoryIdsJson().isEmpty()) {
            try {
                categoryIdsList = objectMapper.readValue(teams.getCategoryIdsJson(), new TypeReference<List<UUID>>() {});
            } catch (JsonProcessingException e) {
                System.err.println("Error parsing categoryIds JSON for Team ID " + teams.getId() + ": " + e.getMessage());
            }
        }

        return new TeamsResponse(
                teams.getId(),
                teams.getName(),
                teams.getDescription(),
                teams.getLeaderId(),
                teams.getContestId(),
                teams.getIsRecruiting(),
                teams.getIsPublic(),
                teams.getMaxMembers(),
                teams.getCreatedByUserId(),
                teams.getCreatedAt(),
                teams.getUpdatedAt(),
                neededRolesList,
                skillsList,
                categoryIdsList,
                teams.getLocation(),
                teams.getRequirements(),
                teams.getContactMethod(),
                teams.getContactInfo(),
                teams.getAllowDirectApply()
        );
    }
}