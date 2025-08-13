package com.contestapp.contestservice.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.contestapp.contestservice.entity.Category;
import com.contestapp.contestservice.entity.Contest;
import com.contestapp.contestservice.entity.ContestStatus;

/**
 * Contest 엔티티 데이터 접근 계층
 * 
 * [역할]
 * - 대회 관련 데이터베이스 조회, 저장, 수정, 삭제 작업
 * - 복잡한 검색 조건을 위한 커스텀 쿼리 메서드 제공
 * 
 * [상속]
 * - JpaRepository<Contest, UUID>: 기본 CRUD 작업 자동 제공
 *   · save(), findById(), findAll(), deleteById() 등
 * 
 * [페이징 처리]
 * - 모든 목록 조회 메서드는 Pageable 파라미터 사용
 * - Page<Contest> 반환으로 페이징 정보 포함
 * 
 * [팀원 확장 가이드]
 * 1. 새로운 검색 조건 추가시 메서드명 규칙 준수: findBy{조건}
 * 2. 복잡한 조건은 @Query 어노테이션으로 JPQL 작성
 * 3. 네이티브 쿼리 필요시 @Query(nativeQuery = true) 사용
 * 4. 성능 최적화를 위해 fetch join 적극 활용
 */
@Repository  // Spring의 데이터 접근 계층 컴포넌트로 등록
public interface ContestRepository extends JpaRepository<Contest, UUID> {

    /**
     * 활성화된 대회 목록 조회 (페이징)
     * 
     * [목적] 삭제되지 않은(isActive=true) 대회만 조회
     * [쿼리 자동 생성] Spring Data JPA가 메서드명으로 쿼리 자동 생성
     * [생성 쿼리] SELECT * FROM contests WHERE is_active = true
     * 
     * [사용 예시]
     * Pageable pageable = PageRequest.of(0, 10, Sort.by("createdAt").descending());
     * Page<Contest> contests = contestRepository.findByIsActiveTrue(pageable);
     * 
     * [컨트롤러 연결] ContestController.getContests() - 필터링 없는 기본 목록
     * 
     * @param pageable 페이징 정보 (페이지 번호, 크기, 정렬 조건)
     * @return 활성화된 대회 목록 (페이징 정보 포함)
     */
    Page<Contest> findByIsActiveTrue(Pageable pageable);

    /**
     * 특정 카테고리에 속한 대회 목록 조회
     * 
     * [목적] 카테고리 필터링으로 대회 목록 조회
     * [JOIN 처리] Contest와 Category의 Many-to-Many 관계 조인
     * [쿼리 경로] 
     *   1. Contest(c) → categories(cat) JOIN
     *   2. cat.id = :categoryId 조건 추가
     *   3. c.isActive = true 조건 추가 (삭제된 대회 제외)
     * 
     * [JPQL 설명]
     * - "SELECT c FROM Contest c": Contest 엔티티 선택
     * - "JOIN c.categories cat": categories 컬렉션과 내부 조인
     * - "WHERE cat.id = :categoryId": 특정 카테고리 ID로 필터링
     * - "AND c.isActive = true": 활성화된 대회만
     * 
     * [사용 예시]
     * // 프로그래밍 카테고리(ID: 1) 대회 조회
     * Page<Contest> contests = contestRepository.findByCategoryId(1L, pageable);
     * 
     * [컨트롤러 연결] ContestController.getContests() - category 파라미터 있는 경우
     * 
     * @param categoryId 조회할 카테고리 ID
     * @param pageable 페이징 정보
     * @return 해당 카테고리의 활성화된 대회 목록
     */
    @Query("SELECT c FROM Contest c JOIN c.categories cat WHERE cat.id = :categoryId AND c.isActive = true")
    Page<Contest> findByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);

    /**
     * 키워드로 대회 검색 (제목, 설명, 주최자 대상)
     * 
     * [목적] 사용자가 입력한 키워드로 대회 전체 검색
     * [검색 대상 필드]
     * 1. title (대회 제목)
     * 2. description (대회 설명)  
     * 3. organizer (주최자명)
     * 
     * [검색 특징]
     * - 대소문자 구분 없음: LOWER() 함수 사용
     * - 부분 일치: LIKE '%keyword%' 패턴
     * - OR 조건: 세 필드 중 하나라도 매치되면 결과에 포함
     * 
     * [JPQL 상세 분석]
     * - "LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))": 
     *   제목에서 대소문자 무시하고 키워드 포함 여부 확인
     * - "OR" 조건으로 여러 필드 검색
     * - "c.isActive = true": 활성화된 대회만 검색
     * 
     * [사용 예시]
     * // "프로그래밍" 키워드로 검색
     * Page<Contest> contests = contestRepository.findByKeyword("프로그래밍", pageable);
     * // 결과: 제목, 설명, 주최자 중 "프로그래밍"이 포함된 모든 대회
     * 
     * [성능 고려사항]
     * - LIKE '%keyword%' 패턴은 인덱스 활용 제한적
     * - 향후 전문 검색 엔진(Elasticsearch) 도입 검토 필요
     * 
     * [컨트롤러 연결] ContestController.getContests() - keyword 파라미터 있는 경우
     * 
     * @param keyword 검색할 키워드 (대소문자 무관)
     * @param pageable 페이징 정보
     * @return 키워드가 포함된 활성화된 대회 목록
     */
    @Query("SELECT c FROM Contest c WHERE c.isActive = true AND (" +
           "LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(c.organizer) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Contest> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 대회 상세 조회 (카테고리 정보 포함)
     * 
     * [목적] 대회 상세 페이지용 데이터 조회 (연관 엔티티 포함)
     * [성능 최적화] LEFT JOIN FETCH로 N+1 문제 해결
     * 
     * [FETCH JOIN 설명]
     * - "LEFT JOIN FETCH c.categories": 카테고리 정보를 한 번의 쿼리로 함께 조회
     * - LAZY 로딩 방지: 카테고리 정보에 접근해도 추가 쿼리 발생 안함
     * - LEFT JOIN: 카테고리가 없는 대회도 조회 결과에 포함
     * 
     * [일반 조회와의 차이점]
     * - findById(): 카테고리 접근시 별도 쿼리 실행 (N+1 문제)
     * - findByIdWithCategories(): 한 번의 쿼리로 모든 정보 조회
     * 
     * [사용 예시]
     * Optional<Contest> contest = contestRepository.findByIdWithCategories(contestId);
     * if (contest.isPresent()) {
     *     List<Category> categories = contest.get().getCategories(); // 추가 쿼리 없음
     * }
     * 
     * [컨트롤러 연결] ContestController.getContest() - 대회 상세 조회
     * 
     * @param contestId 조회할 대회 ID
     * @return 카테고리 정보가 포함된 대회 엔티티 (없으면 Optional.empty())
     */
    @Query("SELECT c FROM Contest c LEFT JOIN FETCH c.categories WHERE c.id = :contestId AND c.isActive = true")
    Optional<Contest> findByIdWithCategories(@Param("contestId") UUID contestId);

    /*
     * [향후 확장 예정 메서드들]
     * 
     * 1. 인기 대회 조회 (참가자 수 기준)
     * @Query("SELECT c FROM Contest c LEFT JOIN c.participations p WHERE c.isActive = true GROUP BY c ORDER BY COUNT(p) DESC")
     * Page<Contest> findPopularContests(Pageable pageable);
     * 
     * 2. 대회 상태별 조회 (진행중, 예정, 종료)
     * @Query("SELECT c FROM Contest c WHERE c.isActive = true AND c.startDate <= :now AND c.endDate >= :now")
     * Page<Contest> findOngoingContests(@Param("now") LocalDateTime now, Pageable pageable);
     * 
     * 3. 특정 사용자의 즐겨찾기 대회 조회
     * @Query("SELECT c FROM Contest c JOIN c.favorites f WHERE f.userId = :userId AND c.isActive = true")
     * Page<Contest> findFavoriteContestsByUserId(@Param("userId") UUID userId, Pageable pageable);
     * 
     * 4. 참가 가능한 대회 조회 (신청 마감 전)
     * @Query("SELECT c FROM Contest c WHERE c.isActive = true AND c.registrationDeadline > :now")
     * Page<Contest> findRegistrableContests(@Param("now") LocalDateTime now, Pageable pageable);
     */


//       //1. 인기 대회 조회 (참가자 수 기준)
//      @Query("SELECT c FROM Contest c LEFT JOIN c.participations p WHERE c.isActive = true GROUP BY c ORDER BY COUNT(p) DESC")
//      Page<Contest> findPopularContests(Pageable pageable);

//      //2. 대회 상태별 조회 (진행중, 예정, 종료)
//       @Query("SELECT c FROM Contest c WHERE c.isActive = true AND c.startDate <= :now AND c.endDate >= :now")
//       Page<Contest> findOngoingContests(@Param("now") LocalDateTime now, Pageable pageable);


//      // 3. 특정 사용자의 즐겨찾기 대회 조회
//      @Query("SELECT c FROM Contest c JOIN c.favorites f WHERE f.userId = :userId AND c.isActive = true")
//       Page<Contest> findFavoriteContestsByUserId(@Param("userId") UUID userId, Pageable pageable);
      
//      // 4. 참가 가능한 대회 조회 (신청 마감 전)
//       @Query("SELECT c FROM Contest c WHERE c.isActive = true AND c.registrationDeadline > :now")
//       Page<Contest> findRegistrableContests(@Param("now") LocalDateTime now, Pageable pageable);

//---------------------------------------수경-------------------------------------
// 모집 상태 기준 조회
Page<Contest> findByStatus(ContestStatus status, Pageable pageable);

Page<Contest> findByCategoriesContaining(Category category, Pageable pageable);

Page<Contest> findByCategoriesContainingAndStatus(Category category, ContestStatus status, Pageable pageable);

Page<Contest> findByRegionSi(String regionSi, Pageable pageable);

Page<Contest> findByRegionSiAndRegionGu(String regionSi, String regionGu, Pageable pageable);

//---------------------------------------수경-------------------------------------


} 