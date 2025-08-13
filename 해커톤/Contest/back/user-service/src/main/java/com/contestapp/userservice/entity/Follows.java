package com.contestapp.userservice.entity;

import jakarta.persistence.*;
import java.util.UUID;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "follows", schema = "user_service")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Follows {
   
    @Id
    @GeneratedValue
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column
    private UUID followerId;

    @Column
    private UUID followingId;
    
    @Column
    private String createdAt;    

    @Builder
    public Follows(UUID id, UUID followerId, UUID followingId, String description) {

        this.id = id;
        this.followerId = followerId;
        this.followingId = followingId;
        this.createdAt = description;       
    }


}