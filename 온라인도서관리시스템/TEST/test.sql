-- 1.1 회원 및 멤버십 테스트
SELECT * FROM membership;
SELECT u.u_id, u.u_name, m.grade, m.mem_disc
FROM user_info u JOIN membership m ON u.grade = m.grade
WHERE ROWNUM <= 5;

-- 1.2 상품 카테고리 테스트
SELECT * FROM bk_cate;
SELECT * FROM sup_cate;

-- 1.3 도서/문구 데이터 테스트
SELECT bk_id, bk_name, bk_price, bk_quantity FROM book WHERE ROWNUM <= 5;
SELECT sup_id, sup_name, sup_price, sup_quan FROM supplies WHERE ROWNUM <= 5;

-- 1.4 상품 테이블 자동 생성 테스트 (트리거 검증)
SELECT * FROM product WHERE pro_id IN ('BK_B1', 'SUP_S1');

-- 2.1 도서 추가 테스트
INSERT INTO book VALUES ('TEST_BOOK', 1, '테스트 도서', 20000, 50, '테스트 저자', '테스트 출판사', '2023-01-01');

-- 2.2 문구 추가 테스트
INSERT INTO supplies VALUES ('TEST_SUP', 101, '테스트 문구', 5000, 100, '테스트 브랜드');

-- 2.3 자동 생성 확인
SELECT * FROM product WHERE pro_id IN ('BK_TEST_BOOK', 'SUP_TEST_SUP');

-- 2.4 재고 차감 트리거 테스트
-- 주문 생성
INSERT INTO orders VALUES (9999, 'A0001', 'PAYMENT_PENDING', 0);

-- 주문 항목 추가 (재고 차감 발생)
INSERT INTO order_item VALUES (9991, 9999, 'BK_B1', 2, 23000);
INSERT INTO order_item VALUES (9992, 9999, 'SUP_S1', 1, 6200);

-- 재고 확인
SELECT bk_id, bk_quantity FROM book WHERE bk_id = 'b1';
SELECT sup_id, sup_quan FROM supplies WHERE sup_id = 'S1';

-- 3.1 할인 적용 테스트 (익명 PL/SQL 블록으로 대체)
BEGIN
    apply_discount(10000, 'A0001');
    COMMIT;
END;
/

-- 또는 직접 로직 구현
DECLARE
    v_discount_rate NUMBER;
    v_total_amount NUMBER;
    v_mem_disc VARCHAR2(10);
BEGIN
    -- 회원 할인율 조회
    SELECT mem_disc INTO v_mem_disc
    FROM membership m
             JOIN user_info u ON m.grade = u.grade
    WHERE u.u_id = 'A0001';

    -- 할인율 계산
    v_discount_rate := TO_NUMBER(REPLACE(v_mem_disc, '%', '')) / 100;

    -- 주문 총액 계산
    SELECT SUM(unit_price * quantity) INTO v_total_amount
    FROM order_item
    WHERE order_id = 10000;

    -- 할인 적용
    UPDATE orders
    SET total_amount = v_total_amount * (1 - v_discount_rate)
    WHERE order_id = 10000;

    COMMIT;
    DBMS_OUTPUT.PUT_LINE('할인 적용 완료: ' || v_total_amount * (1 - v_discount_rate));
END;
/

-- 4.1 결제 정보 입력
INSERT INTO payment VALUES (9999, 9999, 'CREDIT_CARD', 43700, SYSDATE);

-- 4.2 결제 내역 확인
SELECT p.payment_id, o.order_id, u.u_name, p.payment_method, p.payment_amount
FROM payment p
         JOIN orders o ON p.order_id = o.order_id
         JOIN user_info u ON o.u_id = u.u_id
WHERE p.order_id = 9999;

-- 5.1 리뷰 조회
SELECT r.re_num, p.pro_id,
       CASE WHEN p.bk_id IS NOT NULL THEN b.bk_name ELSE s.sup_name END AS product_name,
       u.u_name, r.re_title, r.re_body, r.re_grade, r.re_date
FROM review r
         JOIN product p ON r.pro_id = p.pro_id
         LEFT JOIN book b ON p.bk_id = b.bk_id
         LEFT JOIN supplies s ON p.sup_id = s.sup_id
         JOIN user_info u ON r.u_id = u.u_id
WHERE ROWNUM <= 5;

-- 5.2 리뷰 댓글 조회
SELECT rc.cmt_id, r.re_title, u.u_name AS commenter, rc.cmt_body, rc.cmt_date
FROM review_comment rc
         JOIN review r ON rc.re_num = r.re_num
         JOIN user_info u ON rc.u_id = u.u_id
WHERE ROWNUM <= 3;

-- 6.1 일별 매출 뷰
SELECT * FROM daily_sales
WHERE sales_date BETWEEN TRUNC(SYSDATE)-7 AND TRUNC(SYSDATE)
ORDER BY sales_date DESC;

-- 6.2 베스트셀러 뷰
SELECT product_name, total_quantity, total_sales_amount
FROM bestseller
WHERE sales_rank <= 10
ORDER BY sales_rank;

-- 6.3 회원 구매 분석 뷰
SELECT u_name, grade, total_orders, total_spent, avg_order_value
FROM member_purchase_analysis
WHERE ROWNUM <= 10
ORDER BY total_spent DESC;

-- 7.1 새 회원 가입 및 주문 시나리오
-- Welcome 등급 회원 추가
INSERT INTO user_info VALUES ('TEST_USER', '테스트유저', 'test123', 'password', 'test@example.com', '서울시 강남구', 'Welcome');

-- 주문 생성
INSERT INTO orders VALUES (10001, 'TEST_USER', 'PAYMENT_PENDING', 0);

-- 주문 항목 추가 (Welcome 등급은 할인 없음)
INSERT INTO order_item VALUES (10003, 10001, 'BK_B2', 1, 25000);
INSERT INTO order_item VALUES (10004, 10001, 'SUP_S2', 1, 8900);

-- 할인 적용 (익명 블록으로 대체)
BEGIN
    apply_discount(10001, 'TEST_USER');
    COMMIT;
END;
/

-- 결제 처리
INSERT INTO payment VALUES (10001, 10001, 'CARD', (SELECT total_amount FROM orders WHERE order_id = 10001), SYSDATE);

-- 결과 확인
SELECT o.order_id, u.u_name, m.grade, m.mem_disc,
       o.total_amount, p.payment_amount, p.payment_method
FROM orders o
         JOIN user_info u ON o.u_id = u.u_id
         JOIN membership m ON u.grade = m.grade
         JOIN payment p ON o.order_id = p.order_id
WHERE o.order_id = 10001;

-- 테스트 데이터 삭제
DELETE FROM payment WHERE order_id IN (9999, 10000, 10001);
DELETE FROM order_item WHERE order_id IN (9999, 10000, 10001);
DELETE FROM orders WHERE order_id IN (9999, 10000, 10001);
DELETE FROM product WHERE pro_id IN ('BK_TEST_BOOK', 'SUP_TEST_SUP');
DELETE FROM book WHERE bk_id = 'TEST_BOOK';
DELETE FROM supplies WHERE sup_id = 'TEST_SUP';
DELETE FROM user_info WHERE u_id = 'TEST_USER';
COMMIT;