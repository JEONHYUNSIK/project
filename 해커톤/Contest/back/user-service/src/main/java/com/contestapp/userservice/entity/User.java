package com.contestapp.userservice.entity;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.UUID;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "UUID")
    private UUID id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, unique = true)
    private String phoneNumber;

    // password 필드 제거 - auth-server에서 관리

    @Builder
    public User(UUID id, String email, String username, String phoneNumber) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.phoneNumber = phoneNumber;

    }
} 