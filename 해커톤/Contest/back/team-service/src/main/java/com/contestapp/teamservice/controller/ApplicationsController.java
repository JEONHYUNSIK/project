package com.contestapp.teamservice.controller;

import com.contestapp.teamservice.dto.request.ApplicationRequest;
import com.contestapp.teamservice.dto.response.ApplicationResponse;
import com.contestapp.teamservice.service.ApplicationService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class ApplicationsController {

    private final ApplicationService applicationService;

    // 팀 지원 신청
    @PostMapping("/{teamId}/applyapplications")
    public ResponseEntity<ApplicationResponse> applyToTeam(
            @PathVariable UUID teamId,
            @RequestHeader("X-USER-ID") UUID userId,
            @RequestBody ApplicationRequest request
    ) {
        ApplicationResponse response = applicationService.applyToTeam(teamId, userId, request);
        return ResponseEntity.ok(response);
    }

    // 팀 지원 목록 조회
    @GetMapping("/{teamId}/showapplications")
    public ResponseEntity<List<ApplicationResponse>> getApplicationsByTeam(
            @PathVariable UUID teamId,
            @RequestHeader("X-USER-ID") UUID userId
    ) {
        // 권한 검증 필요시 서비스에서 구현 가능
        List<ApplicationResponse> responses = applicationService.getApplicationsByTeam(teamId);
        return ResponseEntity.ok(responses);
    }

    // 지원 승인
    @PutMapping("/applications/{applicationId}/approve")
    public ResponseEntity<ApplicationResponse> approveApplication(
            @PathVariable UUID applicationId,
            @RequestHeader("X-USER-ID") UUID userId
    ) {
        ApplicationResponse response = applicationService.approve(applicationId, userId);
        return ResponseEntity.ok(response);
    }

    // 지원 거절
    @PutMapping("/applications/{applicationId}/reject")
    public ResponseEntity<ApplicationResponse> rejectApplication(
            @PathVariable UUID applicationId,
            @RequestHeader("X-USER-ID") UUID userId
    ) {
        ApplicationResponse response = applicationService.reject(applicationId, userId);
        return ResponseEntity.ok(response);
    }

    // 지원 취소
    @DeleteMapping("/applications/{applicationId}")
    public ResponseEntity<Void> cancelApplication(
            @RequestHeader("X-USER-ID") UUID userId,
            @PathVariable UUID applicationId
    ) {
        applicationService.cancel(applicationId, userId);
        return ResponseEntity.noContent().build();
    }

    // 내 지원 목록 조회
    @GetMapping("/users/me/applications")
    public ResponseEntity<List<ApplicationResponse>> getMyApplications(
            @RequestHeader("X-USER-ID") UUID userId
    ) {
        List<ApplicationResponse> responses = applicationService.getMyApplications(userId);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/applications/test")
public ResponseEntity<String> test() {
    return ResponseEntity.ok("OK");
}
}