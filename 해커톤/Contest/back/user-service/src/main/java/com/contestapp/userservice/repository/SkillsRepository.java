package com.contestapp.userservice.repository;

import com.contestapp.userservice.entity.Skills;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SkillsRepository extends JpaRepository<Skills, Integer> {
    Optional<Skills> findById(int skillId);
}