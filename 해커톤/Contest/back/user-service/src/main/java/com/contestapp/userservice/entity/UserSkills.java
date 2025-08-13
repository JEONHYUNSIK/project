package com.contestapp.userservice.entity;

import jakarta.persistence.*;

import java.time.OffsetDateTime;
import java.util.UUID;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_skills", schema = "user_service")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class UserSkills {
   
      @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skills skill;

    private int proficiency;


    @Builder
    public UserSkills(UUID userId, int skillId, int proficiency) {
        this.userId = userId;
        this.skill = new Skills(skillId, null, null, null); // Assuming Skills has a constructor that accepts id
        this.proficiency = proficiency;
    }


    

}