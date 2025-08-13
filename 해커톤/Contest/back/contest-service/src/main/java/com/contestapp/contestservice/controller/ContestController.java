package com.contestapp.contestservice.controller;

import java.util.ArrayList;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.contestapp.contestservice.dto.request.ContestCreateRequest;
import com.contestapp.contestservice.dto.request.ContestUpdateRequest;
import com.contestapp.contestservice.dto.response.ContestResponse;
import com.contestapp.contestservice.entity.Contest;
import com.contestapp.contestservice.entity.ContestStatus;
import com.contestapp.contestservice.service.ContestService;

import lombok.RequiredArgsConstructor;
import lombok.val;
import lombok.extern.slf4j.Slf4j;

/**
 * Contest 관련 REST API 컨트롤러
 * * [역할]
 * - 대회 관련 HTTP 요청을 받아 적절한 비즈니스 로직으로 전달
 * - 요청 파라미터 검증 및 응답 데이터 변환
 * - RESTful API 설계 원칙에 따른 엔드포인트 제공
 * * [API 설계 원칙]
 * - REST 규약 준수: GET(조회), POST(생성), PUT(수정), DELETE(삭제)
 * - 명확한 URL 구조: /api/contests/{action}
 * - 표준 HTTP 상태 코드 사용: 200(성공), 404(없음), 400(잘못된 요청)
 * * [응답 형식]
 * - 성공: ResponseEntity<T> with 200 OK
 * - 단일 객체: ContestResponse
 * - 목록: Page<ContestResponse> (페이징 정보 포함)
 * * [에러 처리]
 * - IllegalArgumentException -> 404 Not Found (향후 @ExceptionHandler 추가 예정)
 * - 잘못된 파라미터 -> 400 Bad Request (Spring Validation 추가 예정)
 * * [팀원 확장 가이드]
 * 1. 새 API 추가시 RESTful 규칙 준수
 * 2. 요청/응답 DTO 사용으로 엔티티 직접 노출 금지
 * 3. @Valid 어노테이션으로 요청 데이터 검증
 * 4. @ExceptionHandler로 일관된 에러 응답 제공
 */
@RestController // @Controller + @ResponseBody: JSON 응답을 자동으로 생성
@RequestMapping("/api/contests") // 기본 URL 경로: /api/contests
@RequiredArgsConstructor // Lombok: final 필드들을 파라미터로 받는 생성자 자동 생성
@Slf4j
public class ContestController {

    /**
     * Contest 비즈니스 로직 처리 서비스
     * * [의존성 주입] @RequiredArgsConstructor에 의해 생성자 주입
     * [사용 목적] 실제 비즈니스 로직 실행을 위한 서비스 계층 호출
     */
    private final ContestService contestService;

    /**
     * 대회 목록 조회 API
     * * [HTTP 메서드] GET
     * [URL] /api/contests/list
     * [기능] 페이징, 정렬, 필터링이 가능한 대회 목록 조회
     * * [쿼리 파라미터]
     * - category: 카테고리 ID로 필터링 (선택사항)
     * - keyword: 제목, 설명, 주최자로 검색 (선택사항)
     * - page: 페이지 번호, 0부터 시작 (기본값: 0)
     * - size: 페이지 크기 (기본값: 10, 최대 100 권장)
     * - sortBy: 정렬 기준 필드 (기본값: createdAt)
     * - sortDir: 정렬 방향 (기본값: desc, asc/desc)
     * * [요청 예시]
     * GET /api/contests/list -> 전체 목록 (최신순)
     * GET /api/contests/list?category=1 -> 카테고리 1번 대회 목록
     * GET /api/contests/list?keyword=프로그래밍 -> 키워드 검색
     * GET /api/contests/list?page=1&size=20 -> 2페이지, 20개씩
     * GET /api/contests/list?sortBy=startDate&sortDir=asc -> 시작일 오름차순
     * * [응답 형식]
     * {
     * "content": [ContestResponse...], // 대회 목록
     * "pageable": {...}, // 페이징 정보
     * "totalElements": 100, // 전체 대회 수
     * "totalPages": 10, // 전체 페이지 수
     * "number": 0, // 현재 페이지 번호
     * "size": 10, // 페이지 크기
     * "first": true, // 첫 페이지 여부
     * "last": false // 마지막 페이지 여부
     * }
     * * [프론트엔드 활용]
     * - 대회 목록 페이지의 메인 데이터
     * - 무한 스크롤 또는 페이지네이션 구현
     * - 검색 및 필터링 기능
     * * [성능 고려사항]
     * - 페이징으로 메모리 사용량 제한
     * - size 파라미터는 100 이하로 제한 권장 (향후 검증 추가)
     * - 캐싱 적용 고려 (Redis 등)
     * * @param category 카테고리 ID (null 가능)
     * @param keyword  검색 키워드 (null 가능)
     * @param page     페이지 번호 (0부터 시작)
     * @param size     페이지 크기
     * @param sortBy   정렬 기준 필드명
     * @param sortDir  정렬 방향 (asc/desc)
     * @return 대회 목록과 페이징 정보가 포함된 응답
     */
    @GetMapping("/list") // 👈 이 부분이 "/list"로 되어 있는지 다시 확인해주세요.
    public ResponseEntity<Page<ContestResponse>> getContests(
            @RequestParam(required = false) Long category, // 선택적 카테고리 필터
            @RequestParam(required = false) String keyword, // 선택적 키워드 검색
            @RequestParam(defaultValue = "0") int page, // 기본 첫 페이지
            @RequestParam(defaultValue = "10") int size, // 기본 10개씩
            @RequestParam(defaultValue = "createdAt") String sortBy, // 기본 생성일 정렬
            @RequestParam(defaultValue = "desc") String sortDir) { // 기본 내림차순

        // 정렬 방향 결정: "desc"이면 내림차순, 그 외는 오름차순
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc")
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;

        // Pageable 객체 생성: 페이지 정보 + 정렬 조건
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        // 서비스 계층에서 비즈니스 로직 실행
        Page<Contest> contests = contestService.findContests(category, keyword, pageable);

        // Entity를 DTO로 변환: Page.map()으로 각 요소 변환
        Page<ContestResponse> contestResponses = contests.map(ContestResponse::fromEntity);

        // 200 OK와 함께 변환된 응답 반환
        return ResponseEntity.ok(contestResponses);
    }

    // --- 로그인/비로그인 상세 조회 API 분리 ---

    /**
     * 비로그인 사용자용 대회 상세 조회 API
     *
     * [HTTP 메서드] GET
     * [URL] /api/contests/{contestId}/unauthenticated
     * [기능] 인증이 필요 없는 공개된 대회 상세 정보 조회
     *
     * [요청 예시]
     * GET /api/contests/550e8400-e29b-41d4-a716-446655440000/unauthenticated
     *
     * @param contestId 조회할 대회의 UUID
     * @return 대회 상세 정보 (좋아요 여부 등 개인화 정보 제외)
     */
    @GetMapping("/{contestId}/unauthenticated")
    public ResponseEntity<ContestResponse> getContestForUnauthenticatedUser(@PathVariable UUID contestId) {
        log.info("Request for contest details (unauthenticated): contestId={}", contestId);

        ContestResponse response = contestService.findById(contestId);
        return ResponseEntity.ok(response);
    }

    /**
     * 로그인 사용자용 대회 상세 조회 API
     *
     * [HTTP 메서드] GET
     * [URL] /api/contests/{contestId}/authenticated
     * [기능] 인증된 사용자를 위한 대회 상세 정보 조회
     *
     * [요청 예시]
     * GET /api/contests/550e8400-e29b-41d4-a716-446655440000/authenticated
     *
     * [인증]
     * - 필수: X-User-ID 헤더에 유효한 사용자 ID(UUID) 포함
     *
     * @param contestId 조회할 대회의 UUID
     * @param userId    요청한 사용자의 UUID (헤더에서 추출)
     * @return 대회 상세 정보 (좋아요 여부 등 사용자 맞춤 정보 포함)
     */
    @GetMapping("/{contestId}/authenticated")
    public ResponseEntity<ContestResponse> getContestForAuthenticatedUser(
            @PathVariable UUID contestId,
            @RequestHeader("X-User-ID") UUID userId) {
        log.info("Request for contest details (authenticated): contestId={}, userId={}", contestId, userId);

        ContestResponse response = contestService.findByIdWithAuthStatus(contestId, userId);
        return ResponseEntity.ok(response);
    }

    // --- 기존 API 유지 ---

    /**
     * 서비스 상태 확인 API (테스트/모니터링용)
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Contest Service is running!");
    }

    // 1. 대회 생성 API (관리자용)
    @PostMapping("/create")
    public ResponseEntity<ContestResponse> createContest(
            @val @RequestBody ContestCreateRequest request,
            @RequestHeader("X-User-ID") UUID userId) {
        if (request.getCategoryIds() == null) {
            request.setCategoryIds(new ArrayList<>());
        }
        Contest contest = contestService.createContest(request, userId);
        ContestResponse response = ContestResponse.fromEntity(contest, false, true);
        return ResponseEntity.status(201).body(response);
    }

    // 2. 대회 수정 API (관리자용)
    @PutMapping("/{contestId}/update")
    public ResponseEntity<ContestResponse> updateContest(@PathVariable UUID contestId,
            @RequestBody ContestUpdateRequest request, @RequestHeader("X-User-ID") UUID userId) {
        Contest updatedContest = contestService.updateContest(contestId, request);
        ContestResponse response = ContestResponse.fromEntity(updatedContest, false, true);
        return ResponseEntity.ok(response);
    }

    // 3. 대회 삭제 API (관리자용)
    @DeleteMapping("/{contestId}/deactivate")
    public ResponseEntity<Void> deleteContest(@PathVariable UUID contestId, @RequestHeader("X-User-ID") UUID userId) {
        System.out.println("DELETE 요청 처리: 대회 ID - " + contestId);
        try {
            contestService.deactivateContest(contestId);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            log.warn("DELETE 요청 실패: 대회 ID - {}, 메시지: {}", contestId, e.getMessage());
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("대회 비활성화 중 예상치 못한 오류 발생: 대회 ID - {}", contestId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    //------------------------수경------------------------
    @GetMapping("/status")
    public Page<ContestResponse> getContestsByStatus(
            @RequestParam(required = false) ContestStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "endDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return contestService.getContests(status, page, size, sortBy, sortDir);
    }

    @GetMapping("/region")
    public ResponseEntity<Page<ContestResponse>> getContestsByRegion(
            @RequestParam(required = false) String regionSi,
            @RequestParam(required = false) String regionGu,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Page<Contest> contestPage = contestService.findContestsByRegion(regionSi, regionGu, pageable);
        Page<ContestResponse> responsePage = contestPage.map(ContestResponse::fromEntity);
        return ResponseEntity.ok(responsePage);
    }
    //------------------------수경------------------------
}
