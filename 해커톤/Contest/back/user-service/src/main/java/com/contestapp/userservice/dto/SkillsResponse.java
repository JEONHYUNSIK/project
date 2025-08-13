package com.contestapp.userservice.dto;

import com.contestapp.userservice.entity.Skills;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;


//DB에 저장된 스킬 정보를 반환하는 DTO
//Skills 엔티티를 SkillsResponse로 변환하는 메서드를 포함
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SkillsResponse {

    
    private int id; 
    private String name;
    private String cartegory;
    private String description;

    public static SkillsResponse from(Skills skills) {
        return new SkillsResponse(
                skills.getId(),
                skills.getName(),
                skills.getCategory(),
                skills.getDescription()                
        );
    }
} 