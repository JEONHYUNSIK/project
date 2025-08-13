-- 실버등급을 가지는 모든 고객 정보 출력하기
SELECT * FROM user_info WHERE grade = 'Silver';
--등급별로 고객 인원수 출력 -> group by 사용 
select grade, count(*) from user_info 
    group by grade;

--조인으로 모든 정보 출력하기
-- 파일명 0313_1.sql 조인 수업 참고
select * from user_info, membership 
    where user_info.grade = membership.grade;

--고객의 이름에서 '이'가 포함된 고객 정보와 등급 정보 출력하기 조인사용X
select * from user_info 
    where u_name like '%이%';

-- 모든 도서의 목록을 조회
 -- Book 테이블에서 도서 ID, 제목, 저자, 가격을 조회
 -- 테이블명 book
 -- 도서 ID: bk_id 
 -- 제목: bk_name
 -- 저자: bk_author
 -- 가격: bk_price
 select bk_id, bk_name, bk_author, bk_price from book;

-- 할인율이 10% 이하인 고객의 이름, 이메일, 주소, 등급, 할인율 출력 -> 등급으로 내림차순 정렬
create or replace view cust_grade as
select u.u_name "고객명", u.u_mail "이메일", u.u_addr "고객주소", m.grade "등급",
    to_number(replace(mem_disc, '%', '')) "할인율"
    from user_info u, membership m
    where u.grade=m.grade and 
    to_number(replace(mem_disc, '%', '')) <= 10 order by  u.grade desc;

select * from cust_grade;    

-- 1. 기존 데이터 변경없이 % 기호를 빼고 숫자만 추출하고 to_number 함수로 숫자로 변경
 --예시: SELECT TO_NUMBER(REPLACE(column_name, '%', '')) AS number_value
 --FROM table_name;
 select to_number(replace(mem_disc, '%', '')) as number_value from membership
 
    where to_number(replace(mem_disc, '%', '')) <= 10;
 

--2. 주소가 서울인 고객의 이름, 주소, 등급, 할인율 출력 ->이름으로 오름차순 정렬

 SELECT u.u_name, u. u_addr, m.grade, m.mem_disc
FROM user_info u, membership m
WHERE u.grade = m.grade
AND u.u_addr LIKE '서울%'
ORDER BY u.u_name;
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 
 






