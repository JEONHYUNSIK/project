package com.contestapp.userservice.dto;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import com.contestapp.userservice.entity.UserSkills;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserSkillsResponse {

    private UUID userId;
    private int skillId;
    private String skillName;
    private String category;
    private String description;
    //private int proficiency;


    public static UserSkillsResponse from(UserSkills userSkills) {
        return new UserSkillsResponse(
                userSkills.getUserId(),
                userSkills.getSkill().getId(),
                userSkills.getSkill().getName(),
                userSkills.getSkill().getCategory(),
                userSkills.getSkill().getDescription()
                //userSkills.getProficiency()
        );
    }


    public static List<UserSkillsResponse> from(List<UserSkills> userSkillsList) {
    return userSkillsList.stream()
        .map(UserSkillsResponse::from)
        .collect(Collectors.toList());
    }
} 