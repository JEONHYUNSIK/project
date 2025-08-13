package com.contestapp.contestservice.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.contestapp.contestservice.dto.request.ContestCreateRequest;
import com.contestapp.contestservice.dto.request.ContestUpdateRequest;
import com.contestapp.contestservice.dto.response.ContestResponse;
import com.contestapp.contestservice.entity.Category;
import com.contestapp.contestservice.entity.Contest;
import com.contestapp.contestservice.entity.ContestStatus;
import com.contestapp.contestservice.repository.CategoryRepository;
import com.contestapp.contestservice.repository.ContestRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

/**
 * Contest 비즈니스 로직 처리 서비스
 *
 * [역할]
 * - 대회 관련 핵심 비즈니스 로직 구현
 * - 컨트롤러와 리포지토리 사이의 중간 계층
 * - 트랜잭션 관리 및 데이터 검증
 *
 * [서비스 계층의 책임]
 * 1. 비즈니스 규칙 검증 (예: 대회 날짜 유효성)
 * 2. 복잡한 조회 로직 처리 (필터링, 정렬)
 * 3. 여러 리포지토리를 조합한 복합 작업
 * 4. 트랜잭션 경계 설정
 *
 * [설계 패턴]
 * - DI (Dependency Injection): @RequiredArgsConstructor로 의존성 주입
 * - 읽기 전용 트랜잭션: @Transactional(readOnly = true)로 성능 최적화
 *
 * [팀원 확장 가이드]
 * 1. 새로운 비즈니스 로직 추가시 이 클래스에 메서드 추가
 * 2. 데이터 변경 작업시 @Transactional 어노테이션 필수
 * 3. 예외 처리는 명확한 메시지와 함께 IllegalArgumentException 사용
 * 4. 복잡한 검증 로직은 별도 Validator 클래스로 분리 고려
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContestService {

    private static final Logger log = LoggerFactory.getLogger(ContestService.class);

    private final ContestRepository contestRepository;
    private final CategoryRepository categoryRepository;
    private final ObjectMapper objectMapper;
    private final FavoritesService favoritesService;

    public Page<Contest> findContests(Long categoryId, String keyword, Pageable pageable) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return contestRepository.findByKeyword(keyword.trim(), pageable);
        }

        if (categoryId != null) {
            return contestRepository.findByCategoryId(categoryId, pageable);
        }

        return contestRepository.findByIsActiveTrue(pageable);
    }
    
    /**
     * 비로그인 사용자를 위한 공모전 상세 정보 조회.
     * @param contestId 조회할 공모전 ID
     * @return 좋아요 여부 정보가 없는 공모전 상세 정보
     * @throws IllegalArgumentException 공모전이 존재하지 않거나 비활성화된 경우
     */
    public ContestResponse findById(UUID contestId) {
        log.info("Request for contest details (unauthenticated): contestId={}", contestId);

        Contest contest = contestRepository.findByIdWithCategories(contestId)
                .orElseThrow(() -> new IllegalArgumentException("Contest not found or is inactive."));
        
        if (!contest.getIsActive()) {
            throw new IllegalArgumentException("Contest is not active with ID: " + contestId);
        }

        // 비로그인 상태이므로 isLiked와 isAuthor를 모두 false로 설정하여 반환
        return ContestResponse.fromEntity(contest, false, false);
    }

    /**
     * 로그인 사용자를 위한 공모전 상세 정보 조회 (기존 메서드).
     * @param contestId 조회할 대회의 UUID
     * @param userId 요청한 사용자의 UUID (null일 수 있음)
     * @return isLiked, isAuthor 정보가 포함된 ContestResponse DTO
     * @throws IllegalArgumentException 대회를 찾을 수 없거나 비활성화된 경우
     */
    public ContestResponse findByIdWithAuthStatus(UUID contestId, UUID userId) {
        log.info("Request for contest details: contestId={}, userId={}", contestId, userId);

        Contest contest = contestRepository.findByIdWithCategories(contestId)
                .orElseThrow(() -> new IllegalArgumentException("Contest not found with ID: " + contestId));

        if (!contest.getIsActive()) {
            throw new IllegalArgumentException("Contest is not active with ID: " + contestId);
        }
        
        boolean isLiked = false;
        boolean isAuthor = false;
        
        if (userId != null) {
            isLiked = favoritesService.isFavorite(userId, contestId);
            isAuthor = contest.getCreatedByUserId() != null && contest.getCreatedByUserId().equals(userId);
        }
        
        log.info("Returning ContestResponse for contestId={}, isLiked={}, isAuthor={}", contestId, isLiked, isAuthor);
        
        return ContestResponse.fromEntity(contest, isLiked, isAuthor);
    }
    
    public boolean existsById(UUID contestId) {
        return contestRepository.existsById(contestId);
    }

    @Transactional
    public Contest createContest(ContestCreateRequest request, UUID creatorUserId) {
        String eligibilityJsonString = null;
        String tagsJsonString = null;

        List<Long> categoryIds = request.getCategoryIds();
        List<Category> categories = categoryRepository.findAllById(categoryIds);

        if (categories.size() != categoryIds.size()) {
            throw new IllegalArgumentException("유효하지 않은 카테고리 ID가 포함되어 있습니다.");
        }

        try {
            if (request.getEligibility() != null) {
                eligibilityJsonString = objectMapper.writeValueAsString(request.getEligibility());
            }
            if (request.getTags() != null) {
                tagsJsonString = objectMapper.writeValueAsString(request.getTags());
            }
        } catch (JsonProcessingException e) {
            log.error("참가 자격 또는 태그 목록을 JSON 문자열로 변환하는 데 실패했습니다.", e);
            throw new RuntimeException("대회 자격/태그 JSON 데이터 처리 중 오류 발생", e);
        }

        ContestStatus initialStatus = calculateStatus(request.getEndDate());

        Contest contest = Contest.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .organizer(request.getOrganizer())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .registrationDeadline(request.getRegistrationDeadline())
                .prizeDescription(request.getPrizeDescription())
                .requirements(request.getRequirements())
                .websiteUrl(request.getWebsiteUrl())
                .imageUrl(request.getImageUrl())
                .isActive(true)
                .organizerEmail(request.getOrganizerEmail())
                .organizerPhone(request.getOrganizerPhone())
                .submissionFormat(request.getSubmissionFormat())
                .maxParticipants(request.getMaxParticipants())
                .eligibilityJson(eligibilityJsonString)
                .tagsJson(tagsJsonString)
                .createdByUserId(creatorUserId)
                .categories(categories)
                .status(initialStatus)
                .regionSi(request.getRegionSi())
                .regionGu(request.getRegionGu())
                .build();
        
        return contestRepository.save(contest);
    }

    @Transactional
    public Contest updateContest(UUID contestId, ContestUpdateRequest request) {
        log.info("Updating contest with ID: {}", contestId);
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new IllegalArgumentException("Contest not found with ID: " + contestId));

        if (request.getTitle() != null) {
            contest.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            contest.setDescription(request.getDescription());
        }
        if (request.getOrganizer() != null) {
            contest.setOrganizer(request.getOrganizer());
        }
        if (request.getPrizeDescription() != null) {
            contest.setPrizeDescription(request.getPrizeDescription());
        }
        if (request.getRequirements() != null) {
            contest.setRequirements(request.getRequirements());
        }
        if (request.getWebsiteUrl() != null) {
            contest.setWebsiteUrl(request.getWebsiteUrl());
        }
        if (request.getImageUrl() != null) {
            contest.setImageUrl(request.getImageUrl());
        }
        if (request.getOrganizerEmail() != null) {
            contest.setOrganizerEmail(request.getOrganizerEmail());
        }
        if (request.getOrganizerPhone() != null) {
            contest.setOrganizerPhone(request.getOrganizerPhone());
        }
        if (request.getSubmissionFormat() != null) {
            contest.setSubmissionFormat(request.getSubmissionFormat());
        }
        if (request.getMaxParticipants() != null) {
            contest.setMaxParticipants(request.getMaxParticipants());
        }
        if (request.getStartDate() != null) {
            contest.setStartDate(request.getStartDate());
        }
        if (request.getEndDate() != null) {
            contest.setEndDate(request.getEndDate());
        }
        if (request.getRegistrationDeadline() != null) {
            contest.setRegistrationDeadline(request.getRegistrationDeadline());
        }
        if (request.getIsActive() != null) {
            contest.setIsActive(request.getIsActive());
        }
        if (request.getCategoryIds() != null) {
            List<Long> categoryIds = request.getCategoryIds().stream()
                    .map(ContestUpdateRequest.CategoryIdDto::getId)
                    .collect(Collectors.toList());
            List<Category> categories = categoryRepository.findAllById(categoryIds);
            if (categories.size() != categoryIds.size()) {
                throw new IllegalArgumentException("유효하지 않은 카테고리 ID가 포함되어 있습니다.");
            }
            contest.setCategories(categories);
        }
        
        try {
            if (request.getEligibility() != null) {
                contest.setEligibilityJson(objectMapper.writeValueAsString(request.getEligibility()));
            } else {
                contest.setEligibilityJson(null);
            }

            if (request.getTags() != null) {
                contest.setTagsJson(objectMapper.writeValueAsString(request.getTags()));
            } else {
                contest.setTagsJson(null);
            }
        } catch (JsonProcessingException e) {
            log.error("JSON 데이터를 문자열로 변환하는 중 오류 발생: {}", e.getMessage(), e);
            throw new RuntimeException("대회 자격/태그 데이터 처리 중 오류가 발생했습니다.", e);
        }

        Contest updatedContest = contestRepository.save(contest);
        log.info("Contest with ID: {} updated successfully.", contestId);

        return updatedContest;
    }

    @Transactional
    public void deactivateContest(UUID contestId) {
        log.info("대회 ID: {} 비활성화 시도 중.", contestId);
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new IllegalArgumentException("ID: " + contestId + "에 해당하는 대회를 찾을 수 없습니다."));

        contest.setIsActive(false);

        contestRepository.save(contest);

        log.info("대회 ID: {}가 성공적으로 비활성화되었습니다.", contestId);
    }

    public ContestStatus calculateStatus(LocalDateTime endDate) {
        LocalDateTime now = LocalDateTime.now();

        if (endDate.isBefore(now)) {
            return ContestStatus.CLOSED;
        } else if (endDate.minusDays(3).isBefore(now)) {
            return ContestStatus.CLOSING_SOON;
        } else {
            return ContestStatus.OPEN;
        }
    }

    public Page<ContestResponse> getContests(ContestStatus status, int page, int size, String sortBy, String sortDir) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(sortDir), sortBy));
        Page<Contest> contests;

        if (status == null) {
            contests = contestRepository.findAll(pageable);
        } else {
            contests = contestRepository.findByStatus(status, pageable);
        }

        // ContestResponse.fromEntity(Contest)로 변경하여 인자가 없는 정적 팩토리 메서드를 호출합니다.
        // 이 메서드가 없으면 새로 정의해야 합니다.
        // 현재 코드에 맞게 isLiked, isAuthor를 false로 고정해서 전달하는 방식으로 수정합니다.
        return contests.map(contest -> ContestResponse.fromEntity(contest, false, false));
    }

    @Scheduled(fixedDelay = 10000)
    public void updateContestStatuses() {
        System.out.println(" 스케줄러 실행됨!");
        List<Contest> contests = contestRepository.findAll();
        for (Contest contest : contests) {
            ContestStatus newStatus = calculateStatus(contest.getEndDate());
            if (contest.getStatus() != newStatus) {
                log.info("📌 상태 변경됨: ID={}, {} → {}", contest.getId(), contest.getStatus(), newStatus);
                contest.setStatus(newStatus);
            }
        }
        try {
            contestRepository.saveAll(contests);
        } catch (Exception e) {
            log.error("❌ Contest 저장 중 오류 발생", e);
        }
    }

    @PostConstruct
    public void init() {
        updateContestStatuses();
    }

    public Page<Contest> findContestsByRegion(String regionSi, String regionGu, Pageable pageable) {
        if (regionSi != null && regionGu != null) {
            return contestRepository.findByRegionSiAndRegionGu(regionSi, regionGu, pageable);
        } else if (regionSi != null) {
            return contestRepository.findByRegionSi(regionSi, pageable);
        } else {
            return contestRepository.findAll(pageable);
        }
    }
}