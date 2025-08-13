set SERVEROUTPUT ON;
----------------------------------------------------procedure
-- 1. 카테고리를 입력하면 해당 브랜드의 가장 값이 비싼 제품을 출력하는 프로시저
CREATE OR REPLACE PROCEDURE get_most_exp_pro (
    p_cate_name IN sup_cate.cate%TYPE   -- 입력: 카테고리명
) is
    v_sup_n supplies.sup_name%TYPE;  -- 출력: 제품명
    v_sup_pri supplies.sup_price%TYPE; -- 출력: 가격
    v_sup_b supplies.sup_brand%TYPE;  -- 출력: 브랜드명
-- 일반 변수 커서 설정
    cursor most_exp is
        select sup_name, sup_price, sup_brand
        from supplies s
        join sup_cate sc on sc.cate_id = s.cate_id
        where sc.cate = p_cate_name
        order by s.sup_price desc
        fetch first 1 row only; -- 내림차열 첫번째 행 값 select
begin
-- 커서 열기
    open most_exp;
    fetch most_exp into v_sup_n, v_sup_pri, v_sup_b;
    
    IF most_exp%NOTFOUND THEN
        -- 데이터가 없을 경우
        DBMS_OUTPUT.PUT_LINE('입력한 카테고리에 해당하는 제품이 없습니다.');
    ELSE
        -- 데이터가 있을 경우
        DBMS_OUTPUT.PUT_LINE('가장 비싼 제품: ' || v_sup_n || '(' || v_sup_b || ')');
        DBMS_OUTPUT.PUT_LINE('가격: ' || TO_CHAR(v_sup_pri, 'L00,000'));
    END IF;
    close most_exp;
end;
/
-- 테스트
--accept cate prompt '카테고리 입력'
--exec get_most_exp_pro ('&cate');
-- 1번 프로시저 끝 --

-------------------------------------------------------------------trigger

--CREATE OR REPLACE TRIGGER trg_after_update_grade
--    before INSERT OR UPDATE OR DELETE ON review
--    
--BEGIN
--    MERGE INTO product p
--    USING (
--        SELECT pro_id, NVL(AVG(re_grade), 0) AS avg_grade
--        FROM review
--        GROUP BY pro_id
--    ) r
--    ON (p.pro_id = r.pro_id)
--    WHEN MATCHED THEN
--        UPDATE SET p.pro_grade = r.avg_grade;
--    
--END;
--/
-- 문제 확인 및 수정한 트리거

-- 2. pro_grade의 값이 review 테이블의 
-- pro_id의 데이터에 연결된 각 re_grade의 평균이 되도록 자동으로 반영
CREATE OR REPLACE TRIGGER trg_after_update_grade
    AFTER INSERT OR UPDATE OR DELETE ON review
DECLARE
    -- 변경된 pro_id 목록 저장
    CURSOR cur_pro_id IS
        SELECT DISTINCT pro_id FROM review;
BEGIN
    -- product 테이블 업데이트
    FOR rec IN cur_pro_id LOOP
        UPDATE product p
        SET p.pro_grade = 
            (SELECT NVL(AVG(re_grade), 0) 
            FROM review 
            WHERE pro_id = rec.pro_id)
        WHERE p.pro_id = rec.pro_id;
    END LOOP;
END;
/
---------------------------------------------------------view
-- 각 브랜드별 등록된 문구의 개수 뷰
create or replace view cnt_sup_view as
    select (count(s.sup_brand)||'개') "등록된 브랜드 수", s.sup_brand "브랜드명"
    from supplies s, sup_cate sc
    where sc.cate_id = s.cate_id
    group by s.sup_brand
    order by count(s.sup_brand);    
    
-- 카테고리가 메모용품인 문구의 재고합과 필기구인 문구의 재고합의 총 합계 뷰
create or replace view sum_sup_view as
    select 
    (select sum(sup_quan) 
        from supplies s 
        join sup_cate sc on s.cate_id=sc.cate_id
        where sc.cate='메모용품') as "메모용품 재고",
     (select sum(sup_quan) 
        from supplies s 
        join sup_cate sc on s.cate_id=sc.cate_id
        where sc.cate='필기구') as "필기구 재고",
    (select sum(s.sup_quan) 
        from supplies s
        join sup_cate sc on s.cate_id = sc.cate_id
        where sc.cate in ('메모용품', '필기구')) as "합계 재고"
    from dual;
commit;

-------------------------------------------------------------프로시저, 트리거 시연
--프로시저
accept sup_cn prompt '카테고리를 입력해주세요'
exec get_most_exp_pro('&sup_cn'); -- 캘린더, 노트 등 입력

--트리거
insert into review VALUES (13,'BK_b1','A0020','데이터 시각화','재밌습니다.',8, to_date('18-02-2025','dd-mm-yyyy'));
insert into review VALUES (14,'BK_b1','A0020','데이터 시각화','재밌습니다.',7, to_date('18-02-2025','dd-mm-yyyy'));
insert into review VALUES (15,'BK_b1','A0020','데이터 시각화','재밌습니다.',9, to_date('18-02-2025','dd-mm-yyyy'));
insert into review VALUES (16,'BK_b1','A0020','데이터 시각화','재밌습니다.',10, to_date('18-02-2025','dd-mm-yyyy'));
insert into review VALUES (17,'BK_b1','A0020','데이터 시각화','재밌습니다.',3, to_date('18-02-2025','dd-mm-yyyy'));
-- 데이터 BK_b1에 대한 평점의 평균을 입력함
update review r set r.re_grade = 9 where r.re_num = 13; 
-- 13번 게시글의 평점을 수정
select avg(re_grade) from review where review.pro_id= 'BK_b1'; 
-- product 테이블의 평점과 비교

--view
select * from cnt_sup_view; --각 브랜드별 등록된 문구의 개수
select * from sum_sup_view; 
--카테고리가 메모용품인 문구의 재고합과 필기구인 문구의 재고합의 총 합계



