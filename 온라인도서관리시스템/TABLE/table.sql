DROP TABLE "USER_INFO" CASCADE CONSTRAINTS;
DROP TABLE "MEMBERSHIP" CASCADE CONSTRAINTS;
DROP TABLE "BK_CATE" CASCADE CONSTRAINTS;
DROP TABLE "BOOK" CASCADE CONSTRAINTS;
DROP TABLE "SUP_CATE" CASCADE CONSTRAINTS;
DROP TABLE "SUPPLIES" CASCADE CONSTRAINTS;
DROP TABLE "PRODUCT" CASCADE CONSTRAINTS;
DROP TABLE "CART" CASCADE CONSTRAINTS;
DROP TABLE "CART_ITEM" CASCADE CONSTRAINTS;
DROP TABLE "ORDERS" CASCADE CONSTRAINTS;
DROP TABLE "ORDER_ITEM" CASCADE CONSTRAINTS;
DROP TABLE "PAYMENT" CASCADE CONSTRAINTS;
DROP TABLE review CASCADE CONSTRAINTS;
DROP TABLE review_comment CASCADE CONSTRAINTS;

-- 테이블 생성
CREATE TABLE membership (
                            grade VARCHAR2(50) PRIMARY KEY,
                            mem_disc VARCHAR2(10)
);

CREATE TABLE user_info (
                           u_id VARCHAR2(50) PRIMARY KEY,
                           u_name VARCHAR2(50),
                           u_login VARCHAR2(50),
                           u_pw VARCHAR2(50),
                           u_mail VARCHAR2(50),
                           u_addr VARCHAR2(255),
                           grade VARCHAR2(50) NOT NULL,
                           FOREIGN KEY (grade) REFERENCES membership(grade)
);

CREATE TABLE bk_cate (
                         cate_id NUMBER PRIMARY KEY,
                         cate VARCHAR2(50)
);

CREATE TABLE book (
                      bk_id VARCHAR2(50) PRIMARY KEY,
                      cate_id NUMBER NOT NULL,
                      bk_name VARCHAR2(50) NOT NULL,
                      bk_price NUMBER NOT NULL,
                      bk_quantity NUMBER NOT NULL,
                      bk_author VARCHAR2(50) NOT NULL,
                      bk_pub VARCHAR2(50) NOT NULL,
                      bk_published VARCHAR2(50) NOT NULL,
                      FOREIGN KEY (cate_id) REFERENCES bk_cate(cate_id)
);

CREATE TABLE sup_cate (
                          cate_id NUMBER PRIMARY KEY,
                          cate VARCHAR2(50)
);

CREATE TABLE supplies (
                          sup_id VARCHAR2(50) PRIMARY KEY,
                          cate_id NUMBER NOT NULL,
                          sup_name VARCHAR2(50),
                          sup_price NUMBER,
                          sup_quan NUMBER,
                          sup_brand VARCHAR2(50),
                          FOREIGN KEY (cate_id) REFERENCES sup_cate(cate_id)
);

CREATE TABLE product (
                         pro_id VARCHAR2(50) PRIMARY KEY,
                         sup_id VARCHAR2(50),
                         bk_id VARCHAR2(50),
                         pro_grade NUMBER(5,2),
                         FOREIGN KEY (sup_id) REFERENCES supplies(sup_id),
                         FOREIGN KEY (bk_id) REFERENCES book(bk_id)
);

CREATE TABLE cart (
                      cart_id NUMBER PRIMARY KEY,
                      u_id VARCHAR2(50) NOT NULL,
                      FOREIGN KEY (u_id) REFERENCES user_info(u_id)
);

CREATE TABLE cart_item (
                           cart_item_id NUMBER PRIMARY KEY,
                           pro_id VARCHAR2(50) NOT NULL,
                           cart_id NUMBER NOT NULL,
                           quantity NUMBER,
                           FOREIGN KEY (pro_id) REFERENCES product(pro_id),
                           FOREIGN KEY (cart_id) REFERENCES cart(cart_id)
);

CREATE TABLE orders (
                        order_id NUMBER PRIMARY KEY,
                        u_id VARCHAR2(50) NOT NULL,
                        order_status VARCHAR2(50),
                        total_amount NUMBER,
                        FOREIGN KEY (u_id) REFERENCES user_info(u_id)
);

CREATE TABLE order_item (
                            order_item_id NUMBER PRIMARY KEY,
                            order_id NUMBER NOT NULL,
                            pro_id VARCHAR2(50) NOT NULL,
                            quantity NUMBER,
                            unit_price NUMBER,
                            FOREIGN KEY (order_id) REFERENCES orders(order_id),
                            FOREIGN KEY (pro_id) REFERENCES product(pro_id)
);

CREATE TABLE payment (
                         payment_id NUMBER PRIMARY KEY,
                         order_id NUMBER NOT NULL,
                         payment_method VARCHAR2(50) NOT NULL,
                         payment_amount NUMBER NOT NULL,
                         payment_date DATE DEFAULT SYSDATE,
                         FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

CREATE TABLE review_comment (
                                cmt_id	varchar2(50)		NOT NULL,
                                u_id	varchar2(50)		NOT NULL,
                                re_num	number		NOT NULL,
                                cmt_body	varchar2(255)		NULL,
                                cmt_date	date		NULL
);

CREATE TABLE review (
                        re_num	number		NOT NULL,
                        pro_id	varchar2(50)		NOT NULL,
                        u_id	varchar2(50)		NOT NULL,
                        re_title	varchar2(50)		NULL,
                        re_body	varchar2(255)		NULL,
                        re_grade	number(5)		NULL,
                        re_date	date		NULL
);

ALTER TABLE review_comment ADD CONSTRAINT PK_REVIEW_COMMENT PRIMARY KEY (
                                                                         cmt_id
    );

ALTER TABLE review ADD CONSTRAINT PK_REVIEW PRIMARY KEY (
                                                         re_num
    );

ALTER TABLE review_comment ADD CONSTRAINT FK_user_info_TO_review_comment_1 FOREIGN KEY (
                                                                                        u_id
    )
    REFERENCES user_info (
                          u_id
        );

ALTER TABLE review_comment ADD CONSTRAINT FK_review_TO_review_comment_1 FOREIGN KEY (
                                                                                     re_num
    )
    REFERENCES review (
                       re_num
        );

ALTER TABLE review ADD CONSTRAINT FK_product_TO_review_1 FOREIGN KEY (
                                                                      pro_id
    )
    REFERENCES product (
                        pro_id
        );

ALTER TABLE review ADD CONSTRAINT FK_user_info_TO_review_1 FOREIGN KEY (
                                                                        u_id
    )
    REFERENCES user_info (
                          u_id
        );

-- 트리거 생성
CREATE OR REPLACE TRIGGER trg_after_insert_book
    AFTER INSERT ON book
    FOR EACH ROW
BEGIN
    INSERT INTO product (pro_id, bk_id, sup_id, pro_grade)
    VALUES ('BK_' || UPPER(:NEW.bk_id), :NEW.bk_id, NULL, NULL);
END;
/

CREATE OR REPLACE TRIGGER trg_after_insert_supplies
    AFTER INSERT ON supplies
    FOR EACH ROW
BEGIN
    INSERT INTO product (pro_id, sup_id, bk_id, pro_grade)
    VALUES ('SUP_' || UPPER(:NEW.sup_id), :NEW.sup_id, NULL, NULL);
END;
/

CREATE OR REPLACE TRIGGER trg_after_insert_order_item
    AFTER INSERT ON order_item
    FOR EACH ROW
DECLARE
    v_sup_id VARCHAR2(50);
    v_bk_id VARCHAR2(50);
BEGIN
    SELECT sup_id, bk_id INTO v_sup_id, v_bk_id
    FROM product
    WHERE pro_id = :NEW.pro_id;

    IF v_sup_id IS NOT NULL THEN
        UPDATE supplies
        SET sup_quan = sup_quan - :NEW.quantity
        WHERE sup_id = v_sup_id;
    ELSIF v_bk_id IS NOT NULL THEN
        UPDATE book
        SET bk_quantity = bk_quantity - :NEW.quantity
        WHERE bk_id = v_bk_id;
    END IF;
END;
/

-- 프로시저 생성
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
        WHEN NO_DATA_FOUND THEN
            v_mem_disc := '0%';
    END;

    BEGIN
        v_discount_rate := TO_NUMBER(REPLACE(v_mem_disc, '%', '')) / 100;
    EXCEPTION
        WHEN VALUE_ERROR THEN
            v_discount_rate := 0;
    END;

    SELECT SUM(unit_price * quantity) INTO v_total_amount
    FROM order_item
    WHERE order_id = p_order_id;

    UPDATE orders
    SET total_amount = NVL(v_total_amount, 0) * (1 - NVL(v_discount_rate, 0))
    WHERE order_id = p_order_id;

    COMMIT;
EXCEPTION
    WHEN OTHERS THEN
        ROLLBACK;
        RAISE;
END;
/

-------------------------------------
-- 뷰(VIEW) 생성
-------------------------------------

-- 1. 일별 매출 뷰
CREATE OR REPLACE VIEW daily_sales AS
SELECT
    TRUNC(payment_date) AS sales_date,
    SUM(payment_amount) AS daily_sales_amount,
    COUNT(DISTINCT order_id) AS order_count
FROM payment
GROUP BY TRUNC(payment_date)
ORDER BY sales_date DESC;

-- 2. 베스트셀러 상품 뷰
CREATE OR REPLACE VIEW bestseller AS
SELECT
    p.pro_id,
    CASE
        WHEN p.pro_id LIKE 'BK%' THEN b.bk_name
        WHEN p.pro_id LIKE 'SUP%' THEN s.sup_name
        END AS product_name,
    SUM(oi.quantity) AS total_quantity,
    SUM(oi.unit_price * oi.quantity) AS total_sales_amount,
    RANK() OVER (ORDER BY SUM(oi.quantity) DESC) AS sales_rank
FROM order_item oi
         JOIN product p ON oi.pro_id = p.pro_id
         LEFT JOIN book b ON p.bk_id = b.bk_id
         LEFT JOIN supplies s ON p.sup_id = s.sup_id
GROUP BY p.pro_id,
         CASE
             WHEN p.pro_id LIKE 'BK%' THEN b.bk_name
             WHEN p.pro_id LIKE 'SUP%' THEN s.sup_name
             END;

-- 3. 회원 구매 분석 뷰
CREATE OR REPLACE VIEW member_purchase_analysis AS
SELECT
    u.u_id,
    u.u_name,
    m.grade,
    m.mem_disc,
    COUNT(DISTINCT o.order_id) AS total_orders,
    SUM(p.payment_amount) AS total_spent,
    ROUND(SUM(p.payment_amount) / COUNT(DISTINCT o.order_id), 2) AS avg_order_value
FROM user_info u
         JOIN membership m ON u.grade = m.grade
         JOIN orders o ON u.u_id = o.u_id
         JOIN payment p ON o.order_id = p.order_id
GROUP BY u.u_id, u.u_name, m.grade, m.mem_disc
ORDER BY total_spent DESC;

commit;