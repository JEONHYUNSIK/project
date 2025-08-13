package com.contestapp.contestservice.service;


import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.contestapp.contestservice.dto.request.CategoryRequest;
import com.contestapp.contestservice.dto.response.CategoryResponse;
import com.contestapp.contestservice.dto.response.ContestResponse;
import com.contestapp.contestservice.entity.Category;
import com.contestapp.contestservice.entity.Contest;
import com.contestapp.contestservice.entity.ContestStatus;
import com.contestapp.contestservice.repository.CategoryRepository;
import com.contestapp.contestservice.repository.ContestRepository;

import lombok.RequiredArgsConstructor;

@Service  // Spring의 비즈니스 로직 계층 컴포넌트로 등록
@RequiredArgsConstructor  // Lombok: final 필드들을 파라미터로 받는 생성자 자동 생성
@Transactional(readOnly = true)  
public class CategoryService {
	
	private final CategoryRepository categoryRepository;
    private final ContestRepository contestRepository;
	
	public void deleteCategory(Long id) {
    Category category = categoryRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));

    // 연관된 Contest가 존재하는지 확인
    if (!category.getContests().isEmpty()) {
        throw new RuntimeException("이 카테고리는 공모전과 연결되어 있어 삭제할 수 없습니다.");
    }
    categoryRepository.delete(category);
	}


	public Category updateCategory(Long id, CategoryRequest request) {
    Category category = categoryRepository.findById(id)
        .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));
    if (categoryRepository.existsByName(request.getName()) && 
        !category.getName().equals(request.getName())) {
        throw new RuntimeException("이미 존재하는 카테고리 이름입니다.");
    }
    category.setName(request.getName());
    category.setDescription(request.getDescription());

    return categoryRepository.save(category);
	}

	// 1. 전체 카테고리 목록 조회
    public Page<Category> getAllCategories(Pageable pageable) {
        return categoryRepository.findAll(pageable);
    }

    // 2. 특정 카테고리 조회    (1번 카테고리를 description 까지 보여줌.)
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("카테고리를 찾을 수 없습니다."));
        return CategoryResponse.from(category);
    }




    // (* 1번 카테고리에 속한 모든 공모전을 보여줌)
    public Page<ContestResponse> getContestsByCategoryId(Long categoryId, Pageable pageable) {
    Category category = categoryRepository.findById(categoryId)
        .orElseThrow(() -> new IllegalArgumentException("해당 카테고리가 존재하지 않습니다."));

    List<Contest> contests = category.getContests();

    // 메모리 기반 페이징 처리
    int start = (int) pageable.getOffset();
    int end = Math.min(start + pageable.getPageSize(), contests.size());

    List<ContestResponse> contestResponses = contests.stream()
        .sorted((c1, c2) -> {
            String sortProperty = pageable.getSort().stream().findFirst()
                .map(Sort.Order::getProperty).orElse("id");

            int compareResult = switch (sortProperty) {
                case "title" -> c1.getTitle().compareToIgnoreCase(c2.getTitle());
                case "createdAt" -> c1.getCreatedAt().compareTo(c2.getCreatedAt());
                default -> c1.getId().compareTo(c2.getId());
            };

            boolean isDesc = pageable.getSort().stream()
                .findFirst().map(Sort.Order::getDirection)
                .orElse(Sort.Direction.ASC) == Sort.Direction.DESC;

            return isDesc ? -compareResult : compareResult;
        })
        .map(ContestResponse::from)
        .collect(Collectors.toList());

    List<ContestResponse> pageContent = contestResponses.subList(start, end);

    return new PageImpl<>(pageContent, pageable, contests.size());
    }


    public Page<ContestResponse> getContestsByCategoryAndStatus(Long categoryId, ContestStatus status, Pageable pageable) {
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new RuntimeException("Category not found"));

        Page<Contest> contests;

        if (status == null) {
            contests = contestRepository.findByCategoriesContaining(category, pageable);
        } else {
            contests = contestRepository.findByCategoriesContainingAndStatus(category, status, pageable);
        }
        return contests.map(ContestResponse::fromEntity);
    }
}
