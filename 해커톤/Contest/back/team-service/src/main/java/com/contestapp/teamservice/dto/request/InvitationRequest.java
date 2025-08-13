package com.contestapp.teamservice.dto.request;

import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.UUID;

@Getter // Lombok을 사용하여 Getter 메서드를 자동 생성
@Setter // Lombok을 사용하여 Setter 메서드를 자동 생성
@NoArgsConstructor // Lombok을 사용하여 기본 생성자를 자동 생성
@AllArgsConstructor // Lombok을 사용하여 모든 필드를 인자로 받는 생성자를 자동 생성
public class InvitationRequest {
    private UUID userId;    // 초대받을 사용자의 ID
    private String message; // 초대 메시지
}