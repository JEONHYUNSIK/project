drop table bk_cate CASCADE CONSTRAINTS purge;
drop table book CASCADE CONSTRAINTS purge;
drop table cart CASCADE CONSTRAINTS purge;
drop table cart_item CASCADE CONSTRAINTS purge;
drop table membership CASCADE CONSTRAINTS purge;
drop table order_item CASCADE CONSTRAINTS purge;
 drop table orders CASCADE CONSTRAINTS purge;
drop table product CASCADE CONSTRAINTS purge;
drop table review CASCADE CONSTRAINTS purge;
drop table review_comment CASCADE CONSTRAINTS purge;
drop table sup_cate CASCADE CONSTRAINTS purge;
drop table supplies CASCADE CONSTRAINTS purge;
drop table user_info CASCADE CONSTRAINTS purge;
drop table payment CASCADE CONSTRAINTS purge;



DROP TABLE sup_cate;

CREATE TABLE sup_cate (
	cate_id	number		NOT NULL,
	cate	varchar2(50)		NULL
);

DROP TABLE review_comment;

CREATE TABLE review_comment (
	cmt_id	varchar2(50)		NOT NULL,
	u_id	varchar2(50)		NOT NULL,
	re_num	number		NOT NULL,
	cmt_body	varchar2(255)		NULL,
	cmt_date	date		NULL
);

DROP TABLE book;

CREATE TABLE book (
	bk_id	varchar2(50)		NOT NULL,
	cate_id	number		NOT NULL,
	bk_name	varchar2(50)		NOT NULL,
	bk_price	number		NOT NULL,
	bk_quantity	number		NOT NULL,
	bk_author	varchar2(50)		NOT NULL,
	bk_pub	varchar2(50)		NOT NULL,
	bk_published	varchar2(50)		NOT NULL
);

DROP TABLE order_item;

CREATE TABLE order_item (
	order_item_id	NUMBER		NOT NULL,
	quantity	NUMBER		NULL,
	cart_item_id	NUMBER		NOT NULL,
	order_id	NUMBER		NOT NULL
);

DROP TABLE cart;

CREATE TABLE cart (
	cart_id	NUMBER		NOT NULL,
	u_id	varchar2(50)		NOT NULL
);

DROP TABLE user_info;

CREATE TABLE user_info (
	u_id	varchar2(50)		NOT NULL,
	u_name	varchar2(50)		NULL,
	u_login	varchar2(50)		NULL,
	u_pw	varchar2(50)		NULL,
	u_mail	varchar2(50)		NULL,
	u_addr	varchar2(255)		NULL,
	grade	varchar2(50)		NOT NULL
);

DROP TABLE product;

CREATE TABLE product (
	pro_id	varchar2(50)		NOT NULL,
	sup_id	varchar2(50)		NULL,
	bk_id	varchar2(50)		NULL,
	pro_grade	number(5,2)		NULL
);

DROP TABLE orders;

CREATE TABLE orders (
	order_id	NUMBER		NOT NULL,
	u_id	varchar2(50)		NOT NULL,
	order_status	VARCHAR2(50)		NULL,
	quantity	NUMBER		NULL
);

DROP TABLE review;

CREATE TABLE review (
	re_num	number		NOT NULL,
	pro_id	varchar2(50)		NOT NULL,
	u_id	varchar2(50)		NOT NULL,
	re_title	varchar2(50)		NULL,
	re_body	varchar2(255)		NULL,
	re_grade	number(5)		NULL,
	re_date	date		NULL
);

DROP TABLE cart_item;

CREATE TABLE cart_item (
	cart_item_id	NUMBER		NOT NULL,
	pro_id	varchar2(50)		NOT NULL,
	cart_id	NUMBER		NOT NULL,
	quantity	NUMBER		NULL
);

DROP TABLE supplies;

CREATE TABLE supplies (
	sup_id	varchar2(50)		NOT NULL,
	cate_id	number		NOT NULL,
	sup_name	varchar2(50)		NULL,
	sup_price	number		NULL,
	sup_quan	number		NULL,
	sup_brand	varchar2(50)		NULL
);

DROP TABLE membership;

CREATE TABLE membership (
	grade	varchar2(50)		NOT NULL,
	mem_disc	varchar2(10)		NULL
);

DROP TABLE bk_cate;

CREATE TABLE bk_cate (
	cate_id	number		NOT NULL,
	cate	varchar2(50)		NULL
);

ALTER TABLE sup_cate ADD CONSTRAINT PK_SUP_CATE PRIMARY KEY (
	cate_id
);

ALTER TABLE review_comment ADD CONSTRAINT PK_REVIEW_COMMENT PRIMARY KEY (
	cmt_id
);

ALTER TABLE book ADD CONSTRAINT PK_BOOK PRIMARY KEY (
	bk_id
);

ALTER TABLE order_item ADD CONSTRAINT PK_ORDER_ITEM PRIMARY KEY (
	order_item_id
);

ALTER TABLE cart ADD CONSTRAINT PK_CART PRIMARY KEY (
	cart_id
);

ALTER TABLE user_info ADD CONSTRAINT PK_USER_INFO PRIMARY KEY (
	u_id
);

ALTER TABLE product ADD CONSTRAINT PK_PRODUCT PRIMARY KEY (
	pro_id
);

ALTER TABLE orders ADD CONSTRAINT PK_ORDERS PRIMARY KEY (
	order_id
);

ALTER TABLE review ADD CONSTRAINT PK_REVIEW PRIMARY KEY (
	re_num
);

ALTER TABLE cart_item ADD CONSTRAINT PK_CART_ITEM PRIMARY KEY (
	cart_item_id
);

ALTER TABLE supplies ADD CONSTRAINT PK_SUPPLIES PRIMARY KEY (
	sup_id
);

ALTER TABLE membership ADD CONSTRAINT PK_MEMBERSHIP PRIMARY KEY (
	grade
);

ALTER TABLE bk_cate ADD CONSTRAINT PK_BK_CATE PRIMARY KEY (
	cate_id
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

ALTER TABLE book ADD CONSTRAINT FK_bk_cate_TO_book_1 FOREIGN KEY (
	cate_id
)
REFERENCES bk_cate (
	cate_id
);

ALTER TABLE order_item ADD CONSTRAINT FK_cart_item_TO_order_item_1 FOREIGN KEY (
	cart_item_id
)
REFERENCES cart_item (
	cart_item_id
);

ALTER TABLE order_item ADD CONSTRAINT FK_orders_TO_order_item_1 FOREIGN KEY (
	order_id
)
REFERENCES orders (
	order_id
);

ALTER TABLE cart ADD CONSTRAINT FK_user_info_TO_cart_1 FOREIGN KEY (
	u_id
)
REFERENCES user_info (
	u_id
);

ALTER TABLE user_info ADD CONSTRAINT FK_membership_TO_user_info_1 FOREIGN KEY (
	grade
)
REFERENCES membership (
	grade
);

ALTER TABLE product ADD CONSTRAINT FK_supplies_TO_product_1 FOREIGN KEY (
	sup_id
)
REFERENCES supplies (
	sup_id
);

ALTER TABLE product ADD CONSTRAINT FK_book_TO_product_1 FOREIGN KEY (
	bk_id
)
REFERENCES book (
	bk_id
);

ALTER TABLE orders ADD CONSTRAINT FK_user_info_TO_orders_1 FOREIGN KEY (
	u_id
)
REFERENCES user_info (
	u_id
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

ALTER TABLE cart_item ADD CONSTRAINT FK_product_TO_cart_item_1 FOREIGN KEY (
	pro_id
)
REFERENCES product (
	pro_id
);

ALTER TABLE cart_item ADD CONSTRAINT FK_cart_TO_cart_item_1 FOREIGN KEY (
	cart_id
)
REFERENCES cart (
	cart_id
);

ALTER TABLE supplies ADD CONSTRAINT FK_sup_cate_TO_supplies_1 FOREIGN KEY (
	cate_id
)
REFERENCES sup_cate (
	cate_id
);

ALTER TABLE orders DROP COLUMN quantity;
ALTER TABLE order_item DROP CONSTRAINT FK_cart_item_TO_order_item_1;
ALTER TABLE order_item ADD CONSTRAINT FK_cart_item_TO_order_item FOREIGN KEY (cart_item_id) REFERENCES cart_item(cart_item_id) ON DELETE CASCADE;

commit;