package com.contestapp.teamservice.controller;

import java.util.List; // List import 추가
import java.util.UUID; // UUID import 추가

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.contestapp.teamservice.dto.request.InvitationAcceptRejectRequest;
import com.contestapp.teamservice.dto.request.InvitationRequest;
import com.contestapp.teamservice.entity.Invitations;
import com.contestapp.teamservice.service.InvitationService;

import lombok.RequiredArgsConstructor;

@RestController // 이 클래스가 RESTful API를 처리하는 컨트롤러임을 Spring에 알립니다.
@RequestMapping("/api/invitations") // 이 컨트롤러의 모든 API는 '/api/invitations' 경로로 시작합니다.
@RequiredArgsConstructor // Lombok을 사용하여 final 필드의 생성자를 자동 생성합니다 (의존성 주입).
public class InvitationController {

    private final InvitationService invitationService;

    /**
     * **[API 1] 팀 초대장을 생성하는 API 엔드포인트입니다.**
     * 팀장이 다른 사용자를 초대할 때 사용됩니다.
     *
     * HTTP Method: POST
     * URL: /api/invitations/teams/{teamId}/invite
     * Request Body: { "userId": "UUID", "message": "초대 메시지" }
     *
     * @param teamId 초대장을 보내는 팀의 ID (URL 경로에서 추출)
     * @param invitationRequest 초대받는 사용자의 ID 및 메시지 (요청 본문에서 추출)
     * @return 생성된 초대 정보 또는 오류 메시지
     */
    @PostMapping("/teams/{teamId}/invite")
    public ResponseEntity<?> createInvitation(
            @PathVariable UUID teamId,
            @RequestBody InvitationRequest invitationRequest
    ) {
        try {
            Invitations newInvitation = invitationService.createInvitation(
                    teamId,
                    invitationRequest.getUserId(),
                    invitationRequest.getMessage()
            );
            return new ResponseEntity<>(newInvitation, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("초대 생성 중 오류가 발생했습니다: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * **[API 2] 사용자가 받은 모든 초대 목록을 조회하는 API 엔드포인트입니다.**
     * 초대받은 사용자가 자신의 '내 초대' 목록을 확인할 때 사용됩니다.
     *
     * HTTP Method: GET
     * URL: /api/invitations/users/{userId}
     *
     * @param userId 초대 목록을 조회할 사용자의 ID (URL 경로에서 추출)
     * @return 해당 사용자가 받은 초대 목록
     */
    @GetMapping("/users/{userId}")
    public ResponseEntity<List<Invitations>> getInvitationsForUser(@PathVariable UUID userId) {
        // TODO: 실제 프로젝트에서는 인증된 사용자의 ID와 @PathVariable userId가 일치하는지 확인하는 인가(Authorization) 로직이 필요합니다.
        List<Invitations> invitations = invitationService.getInvitationsForUser(userId);
        return new ResponseEntity<>(invitations, HttpStatus.OK);
    }

    /**
     * **[API 3] 특정 팀이 보낸 모든 초대 목록을 조회하는 API 엔드포인트입니다.**
     * 팀장이 자신의 팀이 보낸 초대 목록과 상태를 확인할 때 사용됩니다.
     *
     * HTTP Method: GET
     * URL: /api/invitations/teams/{teamId}
     *
     * @param teamId 초대 목록을 조회할 팀의 ID (URL 경로에서 추출)
     * @return 해당 팀이 보낸 초대 목록
     */
    @GetMapping("/teams/{teamId}")
    public ResponseEntity<List<Invitations>> getInvitationsForTeam(@PathVariable UUID teamId) {
        // TODO: 실제 프로젝트에서는 요청을 보낸 사용자가 해당 teamId의 팀장인지 확인하는 인가(Authorization) 로직이 필요합니다.
        List<Invitations> invitations = invitationService.getInvitationsForTeam(teamId);
        return new ResponseEntity<>(invitations, HttpStatus.OK);
    }

    /**
     * **[API 4] 사용자가 초대장을 수락하는 API 엔드포인트입니다.**
     *
     * HTTP Method: POST
     * URL: /api/invitations/{invitationId}/accept
     * Request Body: { "userId": "UUID" } // 수락 요청을 보낸 사용자의 ID (인증 정보에서 가져오는 것이 더 일반적)
     *
     * @param invitationId 수락할 초대장의 ID (URL 경로에서 추출)
     * @param requestBody 수락 요청을 보낸 사용자의 ID (요청 본문에서 추출)
     * @return 업데이트된 초대 정보 또는 오류 메시지
     */
    @PostMapping("/{invitationId}/accept")
    public ResponseEntity<?> acceptInvitation(
            @PathVariable UUID invitationId,
            @RequestBody InvitationAcceptRejectRequest requestBody // 새로운 DTO가 필요합니다.
    ) {
        try {
            // ⭐ requestBody에서 userId를 가져와 사용합니다.
            // 실제 시스템에서는 userId를 인증(Authentication)된 사용자 정보에서 직접 가져오는 것이 보안상 더 좋습니다.
            Invitations acceptedInvitation = invitationService.acceptInvitation(invitationId, requestBody.getUserId());
            return new ResponseEntity<>(acceptedInvitation, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("초대 수락 중 오류가 발생했습니다: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * **[API 5] 사용자가 초대장을 거절하는 API 엔드포인트입니다.**
     *
     * HTTP Method: POST
     * URL: /api/invitations/{invitationId}/reject
     * Request Body: { "userId": "UUID" } // 거절 요청을 보낸 사용자의 ID (인증 정보에서 가져오는 것이 더 일반적)
     *
     * @param invitationId 거절할 초대장의 ID (URL 경로에서 추출)
     * @param requestBody 거절 요청을 보낸 사용자의 ID (요청 본문에서 추출)
     * @return 업데이트된 초대 정보 또는 오류 메시지
     */
    @PostMapping("/{invitationId}/reject")
    public ResponseEntity<?> rejectInvitation(
            @PathVariable UUID invitationId,
            @RequestBody InvitationAcceptRejectRequest requestBody // 새로운 DTO가 필요합니다.
    ) {
        try {
            // ⭐ requestBody에서 userId를 가져와 사용합니다.
            // 실제 시스템에서는 userId를 인증(Authentication)된 사용자 정보에서 직접 가져오는 것이 보안상 더 좋습니다.
            Invitations rejectedInvitation = invitationService.rejectInvitation(invitationId, requestBody.getUserId());
            return new ResponseEntity<>(rejectedInvitation, HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("초대 거절 중 오류가 발생했습니다: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}