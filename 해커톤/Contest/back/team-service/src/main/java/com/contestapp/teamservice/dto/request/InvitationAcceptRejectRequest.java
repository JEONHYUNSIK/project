package com.contestapp.teamservice.dto.request;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvitationAcceptRejectRequest {
    private UUID userId; // 초대 수락/거절을 요청한 사용자의 ID
}