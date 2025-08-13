-- 1. 전체 총 매출 조회
SELECT SUM(payment_amount) AS "총 매출"
FROM payment;

-- 2. 월별 매출 분석
SELECT TO_CHAR(payment_date, 'YYYY-MM') AS "년-월",
       SUM(payment_amount)              AS "월별 매출"
FROM payment
GROUP BY TO_CHAR(payment_date, 'YYYY-MM')
ORDER BY "년-월";

-- 3. 상품 카테고리별 매출
SELECT CASE
           WHEN p.pro_id LIKE 'BK_%' THEN '도서'
           WHEN p.pro_id LIKE 'SUP_%' THEN '문구'
           END                          AS "카테고리",
       SUM(oi.unit_price * oi.quantity) AS "매출"
FROM order_item oi
         JOIN product p ON oi.pro_id = p.pro_id
GROUP BY CASE
             WHEN p.pro_id LIKE 'BK_%' THEN '도서'
             WHEN p.pro_id LIKE 'SUP_%' THEN '문구'
             END;

-- 4. 회원 등급별 매출
SELECT u.grade               AS "회원 등급",
       SUM(p.payment_amount) AS "매출"
FROM payment p
         JOIN orders o ON p.order_id = o.order_id
         JOIN user_info u ON o.u_id = u.u_id
GROUP BY u.grade;



-- 1. 일별 매출 뷰
CREATE VIEW daily_sales AS
SELECT TRUNC(payment_date) AS "판매일",
       SUM(payment_amount) AS "일매출"
FROM payment
GROUP BY TRUNC(payment_date);

-- 2. 베스트셀러 상품 뷰
CREATE VIEW bestseller AS
SELECT p.pro_id,
       SUM(oi.quantity)                 AS "총 판매량",
       SUM(oi.unit_price * oi.quantity) AS "매출"
FROM order_item oi
         JOIN product p ON oi.pro_id = p.pro_id
GROUP BY p.pro_id
ORDER BY "총 판매량" DESC;

-- 총 매출 확인
SELECT * FROM daily_sales;  -- 일별 매출
SELECT * FROM bestseller;   -- 베스트셀러 순위


-- 매월 1일 자정에 리포트 생성 (DBMS_SCHEDULER 사용)
BEGIN
    DBMS_SCHEDULER.CREATE_JOB(
            job_name        => 'SALES_REPORT_JOB',
            job_type        => 'PLSQL_BLOCK',
            job_action      => 'BEGIN generate_sales_report; END;',
            start_date      => SYSTIMESTAMP,
            repeat_interval => 'FREQ=MONTHLY; BYMONTHDAY=1',
            enabled         => TRUE
    );
END;
/