DROP TABLE blood_booking cascade CONSTRAINTS purge;
DROP TABLE blood_center cascade CONSTRAINTS purge;
DROP TABLE blood_donor cascade CONSTRAINTS purge;
DROP TABLE blood_keep cascade CONSTRAINTS purge;
DROP TABLE blood_bank cascade CONSTRAINTS purge;
DROP TABLE blood_donee cascade CONSTRAINTS purge;
DROP TABLE donee_booking cascade CONSTRAINTS purge;

CREATE TABLE blood_booking (
	booking_id	varchar2(20)		NOT NULL,
	center_id	varchar2(20)		NOT NULL,
	donor_id	varchar2(20)		NOT NULL,
	bo_donationtype	varchar2(25)		NOT NULL,
	bo_bloodvolume	number		NOT NULL,
	bo_booktime	date		NOT NULL,
	bo_interview	varchar2(20)		NOT NULL,
	bo_gift	varchar2(50)		NOT NULL
);



CREATE TABLE blood_center (
	center_id	varchar2(20)		NOT NULL,
	c_name	varchar2(30)		NOT NULL,
	c_address	varchar2(120)		NOT NULL,
	c_tel	varchar2(30)		NOT NULL
);



CREATE TABLE blood_donor (
	donor_id	varchar2(20)		NOT NULL,
	do_name	varchar2(10)		NOT NULL,
	do_rrnumber	varchar2(30)		NOT NULL,
	do_gender	varchar2(10)		NOT NULL,
	do_address	varchar2(50)		NOT NULL,
	do_tel	varchar2(30)		NOT NULL,
	do_bloodtype	varchar2(10)		NOT NULL
);



CREATE TABLE blood_donee (
	donee_id	varchar2(20)		NOT NULL,
	dee_name	varchar2(10)		NOT NULL,
	dee_rrnumber	varchar2(30)		NOT NULL,
	dee_gender	varchar2(10)		NOT NULL,
	dee_address	varchar2(50)		NOT NULL,
	dee_tel	varchar2(30)		NOT NULL,
	dee_bloodtype	varchar2(10)		NOT NULL
);



CREATE TABLE blood_keep (
	blood_key	varchar2(30)		NOT NULL,
	booking_id	varchar2(20)		NOT NULL,
	center_id	varchar2(20)		NOT NULL,
	bank_id	varchar2(20)		NOT NULL,
	st_date	date		NOT NULL,
	end_date	date		NOT NULL,
	dis_comment	varchar2(255)		NULL,
	status	varchar2(50)		NULL,
	de_booking_id	varchar2(30)		NULL
);



CREATE TABLE blood_bank (
	bank_id	varchar2(20)		NOT NULL,
	bk_name	varchar2(30)		NOT NULL,
	bk_addr	varchar2(50)		NOT NULL,
	bk_tel	varchar2(30)		NOT NULL
);



CREATE TABLE donee_booking (
	de_booking_id	varchar2(30)		NOT NULL,
	donee_id	varchar2(20)		NOT NULL,
	bank_id	varchar2(20)		NOT NULL,
	de_donationtype	varchar2(25)		NOT NULL,
	de_bloodvolume	number		NOT NULL,
	de_booktime	date		NOT NULL
);

ALTER TABLE blood_booking ADD CONSTRAINT PK_BLOOD_BOOKING PRIMARY KEY (
	booking_id
);

ALTER TABLE blood_center ADD CONSTRAINT PK_BLOOD_CENTER PRIMARY KEY (
	center_id
);

ALTER TABLE blood_donor ADD CONSTRAINT PK_BLOOD_DONOR PRIMARY KEY (
	donor_id
);

ALTER TABLE blood_donee ADD CONSTRAINT PK_BLOOD_DONEE PRIMARY KEY (
	donee_id
);

ALTER TABLE blood_keep ADD CONSTRAINT PK_BLOOD_KEEP PRIMARY KEY (
	blood_key
);

ALTER TABLE blood_bank ADD CONSTRAINT PK_BLOOD_BANK PRIMARY KEY (
	bank_id
);

ALTER TABLE donee_booking ADD CONSTRAINT PK_DONEE_BOOKING PRIMARY KEY (
	de_booking_id
);

ALTER TABLE blood_booking ADD CONSTRAINT FK_blood_center_TO_blood_booking_1 FOREIGN KEY (
	center_id
)
REFERENCES blood_center (
	center_id
);

ALTER TABLE blood_booking ADD CONSTRAINT FK_blood_donor_TO_blood_booking_1 FOREIGN KEY (
	donor_id
)
REFERENCES blood_donor (
	donor_id
);

ALTER TABLE blood_keep ADD CONSTRAINT FK_blood_booking_TO_blood_keep_1 FOREIGN KEY (
	booking_id
)
REFERENCES blood_booking (
	booking_id
);

ALTER TABLE blood_keep ADD CONSTRAINT FK_blood_center_TO_blood_keep_1 FOREIGN KEY (
	center_id
)
REFERENCES blood_center (
	center_id
);

ALTER TABLE blood_keep ADD CONSTRAINT FK_blood_bank_TO_blood_keep_1 FOREIGN KEY (
	bank_id
)
REFERENCES blood_bank (
	bank_id
);

ALTER TABLE blood_keep ADD CONSTRAINT FK_donee_booking_TO_blood_keep_1 FOREIGN KEY (
	de_booking_id
)
REFERENCES donee_booking (
	de_booking_id
);

ALTER TABLE donee_booking ADD CONSTRAINT FK_blood_donee_TO_donee_booking_1 FOREIGN KEY (
	donee_id
)
REFERENCES blood_donee (
	donee_id
);

ALTER TABLE donee_booking ADD CONSTRAINT FK_blood_bank_TO_donee_booking_1 FOREIGN KEY (
	bank_id
)
REFERENCES blood_bank (
	bank_id
);

-- 견본 데이터
-- DN-1(헌혈자코드), BO-1(예약번호), B_KEY-1(혈액번호) 계속 변하는 값이므로 1에서 시작
-- CT01, BK01 센터번호, 은행번호는 고정값
insert into blood_donor values ('DN-1','홍길동','990101-1234567','남','대구 신암1동','010-1111-1111','O형');

insert into blood_center values ('CT01','동성로센터','대구 중구 국채보상로 598 정호빌딩 3층','053-252-2285');
insert into blood_center values ('CT02','신월성센터','대구 달서구 조암로 5 월성수메디컬빌딩 6층','053-253-2280');
insert into blood_center values ('CT03','신매광장센터','대구 수성구 달구벌대로 3204-1 석진빌딩 A동 2층','053-795-9767');
insert into blood_center values ('CT04','계명대센터','대구 달서구 달구벌대로 1095 계명대학교 동문 산학협력관(대구은행) 2층','053-582-2285');
insert into blood_center values ('CT05','중앙로센터','대구 중구 중앙대로 390 센트럴엠 2층, 반월당역 13번 출구에서 대구역 방향 250m','053-252-2315');
insert into blood_center values ('CT06','동성로광장센터','대구 중구 동성로 23-2 대백앞 광장 맥도널드 3층','053-254-2901');
insert into blood_center values ('CT07','대구보건대센터','대구 북구 영송로 15 (태전동 산7) 대구보건대학교 내 문화관 1층','053-326-9064');
insert into blood_center values ('CT08','태평로센터','대구 중구 태평로 7 (달성동 147-2) 달성네거리에서 북비산네거리방향 200m 도로변','053-605-5642');
insert into blood_center values ('CT09','경북대북문센터','대구 북구 대학로 83 (산격동 1341-2) 경북대학교 북문 맞은편 4층','053-421-6235');
insert into blood_booking values ('BO-1','CT01','DN-1','전혈',400,to_date('2025-04-29','YYYY-MM-DD'),'가능','편의점교환권 (5000원)');
insert into blood_bank values ('BK01','대구경북혈액원','경상북도 포항시 남구 포스코대로 404','054-272-3889');
insert into blood_donee values ('DE-1','홍길동','990101-1234567','남','대구 신암1동','010-1111-1111','O형');
insert into blood_keep values ('B_KEY-1','BO-1','CT01','BK01',to_date('2025-04-29','YYYY-MM-DD'),to_date('2025-04-29','YYYY-MM-DD')+35,null,null,null);

insert into donee_booking values ('DE_BO-1','DE-1','BK01','전혈',400,to_date('2025-04-29','YYYY-MM-DD'));
insert into donee_booking values ('DE_BO-2','DE-1','BK01','혈소판 성분헌혈',250,to_date('2025-04-29','YYYY-MM-DD'));
--가상테이블 만들기
create or replace view blood_all as
    select bk.blood_key "혈액관리번호", bk.booking_id "예약번호",bk.center_id "지점코드",
    bk.bank_id "은행코드",
    bd.donor_id "헌혈자코드", bd.do_bloodtype "혈액형", bb.bo_donationtype"헌혈종류",
    bb.bo_bloodvolume"헌혈량",
    bk.st_date "보관일자", bk.end_date "만료일자",bk.status"상태",bk.dis_comment"폐기사유"
    from blood_donor bd, blood_booking bb, blood_keep bk
    where bk.booking_id = bb.booking_id and bb.donor_id = bd.donor_id;
//예시
select * from blood_all;
select 혈액형, 헌혈종류, 헌혈량, 보관일자, 만료일자, 폐기사유 from blood_all;
select count(혈액형) from blood_all where 혈액형 = 'O형';

select 혈액형, 헌혈종류 from blood_all group by 혈액형, 헌혈종류;
//큐브 roll_up 



commit;