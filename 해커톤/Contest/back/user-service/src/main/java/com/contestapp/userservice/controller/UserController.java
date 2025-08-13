package com.contestapp.userservice.controller;

import com.contestapp.userservice.dto.UserResponse;
import com.contestapp.userservice.entity.User;
import com.contestapp.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    // UUID 패턴을 확인하기 위한 정규표현식
    private static final Pattern UUID_PATTERN = Pattern.compile("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$");

    /**
     * 현재 로그인한 사용자 정보 조회
     * API Gateway에서 전달받은 헤더 정보를 기반으로 사용자 정보 반환
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getCurrentUser(
            @RequestHeader("X-User-ID") String userIdHeader,
            @RequestHeader("X-User-Username") String username) {

        try {
            UUID userId = UUID.fromString(userIdHeader);
            User user = userService.findById(userId);
            return ResponseEntity.ok(UserResponse.from(user));
        } catch (IllegalArgumentException e) {
            // 헤더의 userId가 유효하지 않거나 사용자를 찾을 수 없는 경우
            // username으로 다시 시도 (username이 email일 수도 있음)
            User user = userService.findByEmail(username);
            return ResponseEntity.ok(UserResponse.from(user));
        }
    }

    /**
     * 특정 사용자 정보 조회 (공개 프로필용)
     * 사용자 이름(username) 또는 사용자 ID(UUID)를 통해 사용자 정보를 조회합니다.
     * 이 메서드는 과도기적으로 두 가지 조회 방식을 모두 지원합니다.
     */
    @GetMapping("/{identifier}")
    public ResponseEntity<UserResponse> getUserByUsernameOrId(@PathVariable String identifier) {

        if (identifier == null || identifier.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        try {
            User user = null;
            // 입력된 문자열이 UUID 패턴과 일치하는지 확인
            if (UUID_PATTERN.matcher(identifier).matches()) {
                // UUID 형식이라면 findById 메서드 호출
                UUID userId = UUID.fromString(identifier);
                user = userService.findById(userId);
            } else {
                // UUID 형식이 아니라면 findByUsername 메서드 호출
                user = userService.findByUsername(identifier);
            }

            if (user == null) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(UserResponse.from(user));

        } catch (Exception e) {
            // 사용자 조회 중 예외 발생 시 (예: findById가 null 반환 등)
            return ResponseEntity.status(500).body(null);
        }
    }

    /**
     * 테스트용 엔드포인트
     */
    @GetMapping("/asdf")
    public ResponseEntity<Map<String, String>> asdf() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "asdf");
        return ResponseEntity.ok(response);
    }

    /**
     * 사용자 검색 (이메일 기반)
     */
    @GetMapping("/search")
    public ResponseEntity<UserResponse> searchUserByEmail(@RequestParam String email) {
        User user = userService.findByEmail(email);
        return ResponseEntity.ok(UserResponse.from(user));
    }
}
