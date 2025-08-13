package com.contestapp.contestservice.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.contestapp.contestservice.dto.request.CategoryRequest;
import com.contestapp.contestservice.dto.response.CategoryResponse;
import com.contestapp.contestservice.dto.response.ContestResponse;
import com.contestapp.contestservice.entity.Category;
import com.contestapp.contestservice.entity.ContestStatus;
import com.contestapp.contestservice.service.CategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
//     | GET | `/categories` | 카테고리 목록 조회 |
//  | GET | `/categories/{categoryId}/contests` | 특정 카테고리의 대회 목록 조회 |

    private final CategoryService categoryService;

    //기본 /api/categories 로 이동
    @GetMapping
    public ResponseEntity<Page<CategoryResponse>> getAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc")
            ? Sort.Direction.DESC
            : Sort.Direction.ASC;

        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<Category> categories = categoryService.getAllCategories(pageable);
        Page<CategoryResponse> responses = categories.map(CategoryResponse::from);
        System.out.println("CategoryResponse : " + responses);
        return ResponseEntity.ok(responses);
    }

    // 특정 카테고리 상세 조회  (description까지 보여주는)
    @GetMapping("/{id}")
    public CategoryResponse getCategoryById(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }

    @GetMapping("/{id}/contests")   //해당 id의 contest들 보여줌
    public ResponseEntity<Page<ContestResponse>> getContestsByCategoryId(
            @PathVariable Long id,
            @RequestParam(required = false) ContestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "title") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc")
            ? Sort.Direction.DESC
            : Sort.Direction.ASC;

        // Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        // Page<ContestResponse> contests = categoryService.getContestsByCategoryId(id, pageable);
        // return ResponseEntity.ok(contests);

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));

        Page<ContestResponse> contests = categoryService.getContestsByCategoryAndStatus(id, status, pageable);
        return ResponseEntity.ok(contests);
    }
    //curl -X GET "http://localhost:8080/api/categories/1/contests?page=0&size=10&sortBy=title&sortDir=asc" -b cookies.txt


    
    // 수정 (PUT)
    @PutMapping("/{id}")
    public CategoryResponse updateCategory(@PathVariable Long id, @RequestBody CategoryRequest request) {
        Category updated = categoryService.updateCategory(id, request);
        return CategoryResponse.from(updated);
    }

    // 삭제 (DELETE)
    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }






}
