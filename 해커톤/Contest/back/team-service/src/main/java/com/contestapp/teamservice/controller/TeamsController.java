package com.contestapp.teamservice.controller;

import java.util.UUID;
import java.util.List; // List import 추가

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.contestapp.teamservice.dto.request.TeamsCreateRequest;
import com.contestapp.teamservice.dto.request.TeamsUpdateRequest;
import com.contestapp.teamservice.dto.response.TeamMemberResponse; // 새로운 DTO import
import com.contestapp.teamservice.dto.response.TeamsResponse;
import com.contestapp.teamservice.service.TeamsService;

import lombok.RequiredArgsConstructor;
import lombok.val;
import lombok.extern.slf4j.Slf4j;

/**
 * 팀 관련 REST API를 처리하는 컨트롤러.
 *
 * [역할]
 * - 클라이언트의 HTTP 요청을 받아 TeamsService로 위임하고, 결과를 HTTP 응답으로 반환.
 * - 요청 데이터의 유효성 검사.
 * - API 엔드포인트 정의.
 *
 * [설계 고려사항]
 * - URL 설계: RESTful 원칙에 따라 자원(팀)을 명확하게 표현.
 * - 응답 코드: 성공/실패에 따른 적절한 HTTP 상태 코드 반환.
 * - 예외 처리: 비즈니스 로직 예외(IllegalArgumentException)를 HTTP 400으로 매핑.
 * - DTO 사용: 요청 및 응답 시 도메인 객체 대신 DTO 사용.
 */
@Slf4j // Lombok을 이용한 로깅
@RestController // 이 클래스가 RESTful 웹 서비스 컨트롤러임을 선언
@RequestMapping("/api/teams") // 기본 경로 설정
@RequiredArgsConstructor // final 필드들을 주입받기 위한 생성자 자동 생성
// @CrossOrigin 어노테이션: 프론트엔드(http://localhost:3000)에서의 요청을 허용하도록 설정
// methods: 허용할 HTTP 메서드 목록 (OPTIONS는 Preflight 요청을 위해 필수)
// allowedHeaders: 모든 헤더 허용
// allowCredentials: 인증 정보 (쿠키, HTTP 인증 등) 허용
// maxAge: Preflight 요청 결과 캐싱 시간 (초)
@CrossOrigin(origins = "http://localhost:3000", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}, allowedHeaders = "*", allowCredentials = "true", maxAge = 3600)
public class TeamsController {

    private final TeamsService teamsService; // TeamsService 주입

    /**
     * 새로운 팀을 생성합니다.
     * POST /api/teams
     *
     * @param request 팀 생성 요청 DTO (JSON 본문)
     * @return 생성된 팀의 응답 DTO와 HTTP 201 Created 상태
     */
    @PostMapping
    public ResponseEntity<TeamsResponse> createTeam(@val @RequestBody TeamsCreateRequest request) { // @Valid 제거 확인
        log.info("POST /api/teams - 팀 생성 요청: {}", request.getName());
        TeamsResponse response = teamsService.createTeam(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 특정 ID의 팀을 조회합니다.
     * GET /api/teams/{teamId}
     *
     * @param teamId 조회할 팀의 UUID
     * @return 조회된 팀의 응답 DTO와 HTTP 200 OK 상태
     */
    @GetMapping("/{teamId}/detail")
    public ResponseEntity<TeamsResponse> getTeamById(@PathVariable UUID teamId) {
        log.info("GET /api/teams/{} - 팀 ID로 조회 요청", teamId);
        TeamsResponse response = teamsService.findTeamById(teamId);
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 팀의 모든 활성 팀원 목록을 조회합니다.
     * GET /api/teams/{teamId}/members
     * * @param teamId 팀원을 조회할 팀의 UUID
     * @return 팀원 목록 DTO (is_active가 true인 멤버만)
     */
    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<TeamMemberResponse>> getTeamMembers(@PathVariable UUID teamId) {
        log.info("GET /api/teams/{}/members - 팀원 목록 조회 요청", teamId);
        List<TeamMemberResponse> members = teamsService.findTeamMembers(teamId);
        return ResponseEntity.ok(members);
    }

    /**
     * 조건에 따라 팀 목록을 조회합니다. (페이징 및 검색 포함)
     * GET /api/teams
     *
     * @param contestId 대회 ID (선택 사항)
     * @param leaderId 리더 ID (선택 사항)
     * @param createdByUserId 생성 사용자 ID (선택 사항)
     * @param status 모집 상태 (선택 사항) - "모집중", "마감임박", "모집완료", "전체"
     * @param keyword 검색 키워드 (팀 이름, 설명) (선택 사항)
     * @param location 활동 지역 (선택 사항)
     * @param skill 기술 스택 (선택 사항)
     * @param contactMethod 연락 방법 (선택 사항)
     * @param allowDirectApply 직접 지원 허용 여부 (선택 사항)
     * @param pageable 페이징 및 정렬 정보 (예: ?page=0&size=10&sort=name,asc)
     * @return 필터링된 팀 목록의 페이지와 HTTP 200 OK 상태
     */
    @GetMapping("/list")
    public ResponseEntity<Page<TeamsResponse>> getTeams(
            @RequestParam(required = false) UUID contestId,
            @RequestParam(required = false) UUID leaderId,
            @RequestParam(required = false) UUID createdByUserId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String contactMethod,
            @RequestParam(required = false) Boolean allowDirectApply,
            Pageable pageable) {
        log.info("GET /api/teams - 팀 목록 조회 요청: contestId={}, leaderId={}, createdByUserId={}, status={}, keyword={}, location={}, skill={}, contactMethod={}, allowDirectApply={}, pageable={}",
                contestId, leaderId, createdByUserId, status, keyword, location, skill, contactMethod, allowDirectApply, pageable);

        // teamsService.findTeams 호출 시 새로운 파라미터들 전달
        Page<TeamsResponse> response = teamsService.findTeams(
                contestId, leaderId, createdByUserId, status, keyword,
                location, skill, contactMethod, allowDirectApply, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 ID의 팀 정보를 업데이트합니다.
     * PUT /api/teams/{teamId}
     *
     * @param teamId 업데이트할 팀의 UUID
     * @param request 팀 업데이트 요청 DTO (JSON 본문)
     * @return 업데이트된 팀의 응답 DTO와 HTTP 200 OK 상태
     */
    @PutMapping("/{teamId}")
    public ResponseEntity<TeamsResponse> updateTeam(
            @PathVariable UUID teamId,
            @val @RequestBody TeamsUpdateRequest request) { // @Valid 제거 확인
        log.info("PUT /api/teams/{} - 팀 업데이트 요청", teamId);
        TeamsResponse response = teamsService.updateTeam(teamId, request);
        return ResponseEntity.ok(response);
    }

    /**
     * 특정 ID의 팀을 비활성화(소프트 삭제)합니다.
     * DELETE /api/teams/{teamId}
     * (DELETE 메서드이지만, 실제로는 isRecruiting, isPublic 필드를 변경하는 소프트 삭제)
     *
     * @param teamId 비활성화할 팀의 UUID
     * @return HTTP 204 No Content 상태
     */
    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> deactivateTeam(@PathVariable UUID teamId) {
        log.info("DELETE /api/teams/{} - 팀 비활성화 요청", teamId);
        teamsService.deactivateTeam(teamId);
        return ResponseEntity.noContent().build(); // 성공적으로 처리되었지만 반환할 내용이 없음
    }

    /**
     * `IllegalArgumentException` 발생 시 400 Bad Request 응답을 처리하는 핸들러.
     * 주로 서비스 계층에서 비즈니스 규칙 위반(예: 중복 이름, 찾을 수 없는 리소스) 시 발생합니다.
     *
     * @param ex 발생한 IllegalArgumentException
     * @return 에러 메시지를 담은 응답과 HTTP 400 Bad Request 상태
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.error("Bad Request (IllegalArgumentException): {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    // 다른 예외 처리 핸들러들을 필요에 따라 추가할 수 있습니다.
    // 예를 들어, @Valid 실패 시 MethodArgumentNotValidException 처리 등.
}