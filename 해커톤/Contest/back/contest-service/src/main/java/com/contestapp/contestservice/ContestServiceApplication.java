package com.contestapp.contestservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Contest Service 메인 애플리케이션 클래스
 * 
 * [역할]
 * - 대회 관리 서비스의 진입점
 * - Spring Boot 애플리케이션 설정 및 실행
 * 
 * [구조 설계 연결점]
 * - contest_service_structure_design.md의 전체 구조를 구현하는 시작점
 * - 마이크로서비스 아키텍처에서 독립적인 대회 관리 서비스 역할
 * 
 * [포트 설정]
 * - application.yml에서 포트 8082로 설정 (API Gateway와 연동)
 * 
 * [팀원 확장 가이드]
 * 1. 새로운 Configuration 클래스 추가시 이 패키지 하위에 config 패키지 생성
 * 2. @ComponentScan으로 추가 패키지 스캔 필요시 이 클래스에 어노테이션 추가
 * 3. 외부 API 연동시 @EnableFeignClients 등 필요한 어노테이션 추가
 */
@SpringBootApplication
@EnableScheduling		// 임막, 만료, 모집중 자동을 위해
public class ContestServiceApplication {

	/**
	 * Contest Service 시작점
	 * 
	 * [실행 순서]
	 * 1. Spring Boot 자동 설정 로드
	 * 2. JPA 엔티티 스캔 및 테이블 생성/검증
	 * 3. Component 스캔으로 @Controller, @Service, @Repository 등록
	 * 4. 포트 8082에서 HTTP 서버 시작
	 * 
	 * @param args 실행 인자 (프로파일, 포트 등 오버라이드 가능)
	 */
	public static void main(String[] args) {
		SpringApplication.run(ContestServiceApplication.class, args);
	}

}
