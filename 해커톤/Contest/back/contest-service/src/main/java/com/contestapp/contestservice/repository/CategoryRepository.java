package com.contestapp.contestservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.contestapp.contestservice.entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>{
    // 기본 CRUD 제공됨 (findAll, findById, save, delete 등)

    // 예: 카테고리 이름으로 찾는 커스텀 메서드 (중복 방지 또는 검증용)
    boolean existsByName(String name);
}

