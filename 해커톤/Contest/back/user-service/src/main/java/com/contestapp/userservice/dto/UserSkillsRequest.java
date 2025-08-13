package com.contestapp.userservice.dto;

import java.util.List;
import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSkillsRequest {   
    
    private UUID userId;

    List<SkillProficiency> skills;


    @Getter
    @Setter
    public static class SkillProficiency {
        int skillId;
        int proficiency;
    }
    
} 