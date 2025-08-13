-------------------------------------
-- 테이블 구조 개선 (기존 테이블 삭제 후 재생성)
-------------------------------------
-- DROP 구문 생략 (기존 파일과 동일)

-- orders 테이블에 total_amount 컬럼 추가
ALTER TABLE orders ADD total_amount NUMBER;

-- payment 테이블 생성
CREATE TABLE payment (
                         payment_id NUMBER PRIMARY KEY,
                         order_id NUMBER NOT NULL,
                         payment_method VARCHAR2(50) NOT NULL,
                         payment_amount NUMBER NOT NULL,
                         payment_date DATE DEFAULT SYSDATE,
                         CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- order_item 테이블 재정의
drop table order_item;
CREATE TABLE order_item (
                            order_item_id NUMBER PRIMARY KEY,
                            order_id NUMBER NOT NULL,
                            pro_id VARCHAR2(50) NOT NULL,
                            quantity NUMBER NOT NULL,
                            unit_price NUMBER NOT NULL,
                            CONSTRAINT fk_product_order FOREIGN KEY (pro_id) REFERENCES product(pro_id),
                            CONSTRAINT fk_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-------------------------------------
-- 트리거 및 프로시저
-------------------------------------

-- 재고 관리 트리거
CREATE OR REPLACE TRIGGER trg_after_insert_order_item
    AFTER INSERT ON order_item
    FOR EACH ROW
DECLARE
    v_sup_id VARCHAR2(50);
    v_bk_id VARCHAR2(50);
BEGIN
    SELECT sup_id, bk_id INTO v_sup_id, v_bk_id
    FROM product WHERE pro_id = :NEW.pro_id;

    IF v_sup_id IS NOT NULL THEN
        UPDATE supplies SET sup_quan = sup_quan - :NEW.quantity
        WHERE sup_id = v_sup_id;
    ELSIF v_bk_id IS NOT NULL THEN
        UPDATE book SET bk_quantity = bk_quantity - :NEW.quantity
        WHERE bk_id = v_bk_id;
    END IF;
END;
/

-- 할인 적용 프로시저 (개선 버전)
CREATE OR REPLACE PROCEDURE apply_discount (
    p_order_id IN NUMBER,
    p_user_id IN VARCHAR2
) AS
    v_discount_rate NUMBER := 0;
    v_total_amount NUMBER := 0;
    v_mem_disc VARCHAR2(10);
BEGIN
    BEGIN
        SELECT mem_disc INTO v_mem_disc
        FROM membership m
                 JOIN user_info u ON m.grade = u.grade
        WHERE u.u_id = p_user_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN v_mem_disc := '0%';
    END;

    BEGIN
        v_discount_rate := TO_NUMBER(REPLACE(v_mem_disc, '%', '')) / 100;
    EXCEPTION
        WHEN VALUE_ERROR THEN v_discount_rate := 0;
    END;

    SELECT SUM(unit_price * quantity) INTO v_total_amount
    FROM order_item WHERE order_id = p_order_id;

    UPDATE orders SET
        total_amount = NVL(v_total_amount,0) * (1-NVL(v_discount_rate,0))
    WHERE order_id = p_order_id;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

--test
BEGIN
    -- 변수 선언
    DECLARE
        user_exists NUMBER;
        product1_exists NUMBER;
        product2_exists NUMBER;
    BEGIN
        -- 1. 필수 마스터 데이터 확인
        SELECT COUNT(*) INTO user_exists FROM user_info WHERE u_id = 'A0001';
        SELECT COUNT(*) INTO product1_exists FROM product WHERE pro_id = 'BK_B1';
        SELECT COUNT(*) INTO product2_exists FROM product WHERE pro_id = 'SUP_S1';

        -- 데이터 존재 여부 검증
        IF user_exists = 0 OR product1_exists = 0 OR product2_exists = 0 THEN
            RAISE_APPLICATION_ERROR(-20001, '필수 데이터가 존재하지 않습니다.');
        END IF;

        -- 2. 주문 생성
        INSERT INTO orders (order_id, u_id, order_status, total_amount)
        VALUES (1001, 'A0001', 'PAYMENT_PENDING', 0);

        -- 3. 주문 항목 추가 (동적 가격 조회)
        INSERT INTO order_item (order_item_id, order_id, pro_id, quantity, unit_price)
        VALUES (
                   1,
                   1001,
                   'BK_B1',
                   2,
                   (SELECT bk_price FROM book WHERE bk_id = 'b1')  -- pro_id='BK_B1'은 bk_id='b1'과 매핑
               );

        INSERT INTO order_item (order_item_id, order_id, pro_id, quantity, unit_price)
        VALUES (
                   2,
                   1001,
                   'SUP_S1',
                   1,
                   (SELECT sup_price FROM supplies WHERE sup_id = 'S1')  -- pro_id='SUP_S1'은 sup_id='S1'과 매핑
               );

        -- 4. 할인 적용
        apply_discount(1001, 'A0001');

        -- 5. 결제 정보 입력
        INSERT INTO payment (payment_id, order_id, payment_method, payment_amount, payment_date)
        VALUES (
                   9001,
                   1001,
                   'CREDIT_CARD',
                   (SELECT total_amount FROM orders WHERE order_id = 1001),
                   SYSDATE
               );

        COMMIT;
        DBMS_OUTPUT.PUT_LINE('주문 및 결제 완료');

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            DBMS_OUTPUT.PUT_LINE('오류: 필수 데이터가 존재하지 않습니다.');
            ROLLBACK;
        WHEN OTHERS THEN
            DBMS_OUTPUT.PUT_LINE('오류: ' || SQLERRM);
            ROLLBACK;
    END;
END;
/

SELECT * FROM user_info WHERE u_id = 'A0001';

-- 상품 확인
SELECT * FROM product WHERE pro_id IN ('BK_B1', 'SUP_S1');

-- 원본 데이터 (book/supplies) 확인
SELECT * FROM book WHERE bk_id = 'b1';
SELECT * FROM supplies WHERE sup_id = 'S1';