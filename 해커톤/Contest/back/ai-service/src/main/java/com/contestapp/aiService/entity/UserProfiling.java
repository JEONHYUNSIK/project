package com.contestapp.aiService.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

import org.hibernate.annotations.GenericGenerator;
import org.hibernate.annotations.Type;

import com.vladmihalcea.hibernate.type.json.JsonType;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_profiling", schema = "ai_service")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfiling implements Serializable {

   @Id
    @GeneratedValue(generator = "uuid2")
    @GenericGenerator(name = "uuid2", strategy = "org.hibernate.id.UUIDGenerator")
    private UUID id;

    @Column(name = "user_id", nullable = false, unique = true)
    private UUID userId;

    // PostgreSQL JSONB <-> Java Map
    @Type(value = JsonType.class)
    @Column(name = "profiling_data", columnDefinition = "jsonb", nullable = false)
    private Map<String, String> profilingData;

    @Column(name = "created_at")
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt = OffsetDateTime.now();

    public UserProfiling(UUID userId, Map<String, String> profilingData) {
        this.userId = userId;
        this.profilingData = profilingData;
        this.createdAt = OffsetDateTime.now();
        this.updatedAt = OffsetDateTime.now();
    }

} 