package com.contestapp.contestservice.entity;

// 모집 상태를 나타내는 열거형 클래스입니다.
// 각각의 상태는 프론트에서 보여질 수 있는 상태 필터로 사용됩니다.
// Enum(열거형)은 관련 있는 상수들의 집합을 정의하는 자료형
public enum ContestStatus {
    OPEN,          // 모집 중 (마감일까지 여유 있음)
    CLOSING_SOON,  // 모집 임박 (마감일이 얼마 남지 않음)
    CLOSED         // 모집 마감 (이미 종료됨)
}
