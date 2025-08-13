package com.contestapp.aiService.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;

import java.time.OffsetDateTime;
import java.util.UUID;



import lombok.AccessLevel;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "recommendations")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Recommendations implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "entity_id", nullable = false)
    private UUID entityId;

    @Column(name = "entity_type", nullable = false)
    private String entityType; // "CONTEST"

    private BigDecimal score;
    private String reason;
    private boolean isViewed = false;
    private boolean isClicked = false;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();
    
} 