INSERT ALL
    INTO membership (grade, mem_disc) VALUES ('Bronze', '5%')
    INTO membership (grade, mem_disc) VALUES ('Silver', '10%')
    INTO membership (grade, mem_disc) VALUES ('Gold', '15%')
    
SELECT * FROM dual;

--맴버십 테이블에 웰컴 등급 추가 : 할인율 0%
insert into membership (grade, mem_disc) values ('Welcome', '0%');

INSERT ALL
    INTO user_info VALUES ('A0001', '김영민', 'kim123', 'password1', 'kim123@example.com', '서울특별시 강남구 역삼동', 'Bronze')
    INTO user_info VALUES ('A0002', '이하늘', 'sky456', 'password2', 'sky456@example.com', '부산광역시 해운대구', 'Silver')
    INTO user_info VALUES ('A0003', '박지민', 'parkyoung', 'password3', 'parkyoung@example.com', '대구광역시 수성구', 'Gold')
    INTO user_info VALUES ('A0004', '최진수', 'choi123', 'password4', 'choi123@example.com', '인천광역시 연수구', 'Bronze')
    INTO user_info VALUES ('A0005', '정수빈', 'jeong456', 'password5', 'jeong456@example.com', '광주광역시 북구', 'Silver')
    INTO user_info VALUES ('A0006', '김지혜', 'kim789', 'password6', 'kim789@example.com', '대전광역시 유성구', 'Gold')
    INTO user_info VALUES ('A0007', '이민호', 'lee123', 'password7', 'lee123@example.com', '울산광역시 남구', 'Bronze')
    INTO user_info VALUES ('A0008', '오세훈', 'ohsehun123', 'password8', 'ohsehun123@example.com', '경기도 수원시', 'Silver')
    INTO user_info VALUES ('A0009', '한지민', 'hanji456', 'password9', 'hanji456@example.com', '서울특별시 마포구', 'Gold')
    INTO user_info VALUES ('A0010', '최영수', 'choi789', 'password10', 'choi789@example.com', '강원도 춘천시', 'Bronze')
    INTO user_info VALUES ('A0011', '김민주', 'kim910', 'password11', 'kim910@example.com', '경기도 성남시', 'Silver')
    INTO user_info VALUES ('A0012', '이정은', 'lee654', 'password12', 'lee654@example.com', '서울특별시 용산구', 'Gold')
    INTO user_info VALUES ('A0013', '박진영', 'park123', 'password13', 'park123@example.com', '서울특별시 송파구', 'Bronze')
    INTO user_info VALUES ('A0014', '유진영', 'yujin567', 'password14', 'yujin567@example.com', '경기도 화성시', 'Silver')
    INTO user_info VALUES ('A0015', '김하늘', 'kim234', 'password15', 'kim234@example.com', '부산광역시 기장군', 'Gold')
    INTO user_info VALUES ('A0016', '정혜린', 'jeong321', 'password16', 'jeong321@example.com', '서울특별시 강서구', 'Bronze')
    INTO user_info VALUES ('A0017', '이호준', 'lee987', 'password17', 'lee987@example.com', '충청북도 청주시', 'Silver')
    INTO user_info VALUES ('A0018', '박성준', 'park654', 'password18', 'park654@example.com', '전라북도 전주시', 'Gold')
    INTO user_info VALUES ('A0019', '김상현', 'kim321', 'password19', 'kim321@example.com', '경기도 고양시', 'Bronze')
    INTO user_info VALUES ('A0020', '이시은', 'lee159', 'password20', 'lee159@example.com', '대전광역시 서구', 'Silver')
    INTO user_info VALUES ('A0021', '조성환', 'cho123', 'password21', 'cho123@example.com', '강원도 원주시', 'Gold')
    INTO user_info VALUES ('A0022', '최지혜', 'choi432', 'password22', 'choi432@example.com', '경상남도 창원시', 'Bronze')
    INTO user_info VALUES ('A0023', '송지수', 'song321', 'password23', 'song321@example.com', '경기도 안양시', 'Silver')
    INTO user_info VALUES ('A0024', '이민지', 'lee876', 'password24', 'lee876@example.com', '서울특별시 성동구', 'Gold')
    INTO user_info VALUES ('A0025', '한승연', 'han123', 'password25', 'han123@example.com', '대구광역시 달서구', 'Bronze')
    INTO user_info VALUES ('A0026', '정다영', 'jeong147', 'password26', 'jeong147@example.com', '서울특별시 강동구', 'Silver')
    INTO user_info VALUES ('A0027', '김경민', 'kim456', 'password27', 'kim456@example.com', '인천광역시 부평구', 'Gold')
    INTO user_info VALUES ('A0028', '이유진', 'lee321', 'password28', 'lee321@example.com', '경기도 부천시', 'Bronze')
    INTO user_info VALUES ('A0029', '박준형', 'park567', 'password29', 'park567@example.com', '전라남도 목포시', 'Silver')
    INTO user_info VALUES ('A0030', '김정호', 'kim654', 'password30', 'kim654@example.com', '충청남도 천안시', 'Gold')
    INTO user_info VALUES ('A0031', '정유진', 'jeong123', 'password31', 'jeong123@example.com', '서울특별시 강남구', 'Bronze')
    INTO user_info VALUES ('A0032', '김도현', 'kim321', 'password32', 'kim321@example.com', '부산광역시 동래구', 'Silver')
    INTO user_info VALUES ('A0033', '이유빈', 'lee555', 'password33', 'lee555@example.com', '대전광역시 동구', 'Gold')
    INTO user_info VALUES ('A0034', '최현주', 'choi876', 'password34', 'choi876@example.com', '서울특별시 중구', 'Bronze')
    INTO user_info VALUES ('A0035', '정다영', 'jeong432', 'password35', 'jeong432@example.com', '광주광역시 서구', 'Silver')
    INTO user_info VALUES ('A0036', '김영수', 'kim789', 'password36', 'kim789@example.com', '경기도 남양주시', 'Gold')
    INTO user_info VALUES ('A0037', '이정수', 'lee101', 'password37', 'lee101@example.com', '강원도 속초시', 'Bronze')
    INTO user_info VALUES ('A0038', '박수진', 'park543', 'password38', 'park543@example.com', '경상북도 포항시', 'Silver')
    INTO user_info VALUES ('A0039', '유다혜', 'yudahae1', 'password39', 'yudahae1@example.com', '서울특별시 구로구', 'Gold')
    INTO user_info VALUES ('A0040', '김주희', 'kimjoo123', 'password40', 'kimjoo123@example.com', '부산광역시 부산진구', 'Bronze')
    INTO user_info VALUES ('A0041', '박민석', 'park987', 'password41', 'park987@example.com', '대구광역시 중구', 'Silver')
    INTO user_info VALUES ('A0042', '이소희', 'lee4321', 'password42', 'lee4321@example.com', '서울특별시 종로구', 'Gold')
    INTO user_info VALUES ('A0043', '김성민', 'kim1357', 'password43', 'kim1357@example.com', '인천광역시 미추홀구', 'Bronze')
    INTO user_info VALUES ('A0044', '정윤미', 'jeong987', 'password44', 'jeong987@example.com', '서울특별시 서초구', 'Silver')
    INTO user_info VALUES ('A0045', '이호영', 'lee786', 'password45', 'lee786@example.com', '경기도 광명시', 'Gold')
    INTO user_info VALUES ('A0046', '정서연', 'jeong765', 'password46', 'jeong765@example.com', '대전광역시 대덕구', 'Bronze')
    INTO user_info VALUES ('A0047', '박정은', 'park321', 'password47', 'park321@example.com', '경기도 의정부시', 'Silver')
    INTO user_info VALUES ('A0048', '김보영', 'kimbo123', 'password48', 'kimbo123@example.com', '서울특별시 강북구', 'Gold')
    INTO user_info VALUES ('A0049', '이상호', 'lee3217', 'password49', 'lee3217@example.com', '전라북도 익산시', 'Bronze')
    INTO user_info VALUES ('A0050', '송윤희', 'song3217', 'password50', 'song3217@example.com', '서울특별시 성북구', 'Silver')
    SELECT * FROM dual;

commit;
-- 여기까지 사용자 정보

insert all  

--bk_cate테이블에 데이터 입력-- 
    into bk_cate   values(1,'IT')
    into bk_cate  values(2,'소설')
    into bk_cate  values(3,'자기계발')
    into bk_cate  values(4,'역사')
    into bk_cate  values(5,'여행')
    into bk_cate  values(6,'과학')
    
--book테이블에 데이터 입력--
    into book values('b1',1,'오라클SQl',23000, 100, '이지훈','이지스퍼블리싱','2018/10/30')
    into book values ('b2', 1, '파이썬', 25000, 150, '김영희', '한빛미디어','2018/10/31')
    into book values ('b3', 1, '자바', 30000, 200, '이민수', '길벗','2018/10/20')
    into book values ('b4', 1, 'C++ 프로그래밍', 28000, 180, '박지연', '프리렉','2019/11/30')
    into book values ('b5', 2, '백년의 고독', 15000, 300, '가브리엘 가르시아 마르케스', '민음사','2019/9/30')
    into book values ('b6', 3, '자기혁명', 20000, 250, '안드레아스 슈라이버', '위즈덤하우스','2019/8/30')
    into book values ('b7', 4, '총균쇠', 22000, 400, '재레드 다이아몬드', '사계절','2012/11/30')
    into book values ('b8', 6, '코스모스', 18000, 350, '칼 세이건', '사이언스북스','2013/7/30')
    into book values ('b9', 5, '여행의 기술', 24000, 180, '리처드 브랜슨', '북하우스','2014/5/30')
    into book values ('b10', 1, '자바스크립트', 27000, 160, '이상엽', '한빛미디어', '2020/1/15')
     into book values ('b11', 1, '리액트 입문', 29000, 120, '홍길동', '프리렉', '2021/2/20')
    into book values ('b12', 2, '안드로이드 개발', 32000, 90, '김철수', '한빛미디어', '2021/3/15')
    into book values ('b13', 3, '파이썬 데이터 분석', 31000, 110, '이영희', '위즈덤하우스', '2020/12/01')
    into book values ('b14', 4, '자바스크립트 완벽 가이드', 34000, 80, '박상현', '사이언스북스', '2022/1/10')
    into book values ('b15', 5, 'C# 프로그래밍', 26000, 150, '최민수', '길벗', '2022/2/25')
    into book values ('b16', 6, 'HTML5+CSS3', 25000, 140, '김영수', '한빛미디어', '2021/11/05')
    into book values ('b17', 1, 'NODE.JS 실전', 33000, 100, '이주현', '프리렉', '2021/8/30')
    into book values ('b18', 3, '딥러닝 입문', 36000, 70, '정수빈', '사계절', '2022/3/12')
    into book values ('b19', 4, '운영체제', 37000, 60, '이상훈', '한빛미디어', '2021/6/20')
    into book values ('b20', 5, '알고리즘 문제 해결', 38000, 50, '최지혜', '민음사', '2022/5/15')
    into book values ('b21', 1, '모던 자바스크립트', 30000, 130, '김민재', '사이언스북스', '2021/7/25')
    into book values ('b22', 2, 'SWIFT 기초', 34000, 90, '이현우', '길벗', '2021/9/10')
    into book values ('b23', 6, 'R 프로그래밍', 31000, 80, '박지은', '위즈덤하우스', '2022/4/05')
    into book values ('b24', 3, '데이터베이스 시스템', 33000, 110, '정호진', '한빛미디어', '2021/6/15')
    into book values ('b25', 4, '소프트웨어 공학', 35000, 70, '김하늘', '프리렉', '2022/1/12')
    into book values ('b26', 5, '운영체제 원리', 36000, 60, '이민호', '사계절', '2022/3/22')
    into book values ('b27', 1, '웹 개발의 정석', 38000, 50, '홍길동', '민음사', '2022/2/28')
    into book values ('b28', 2, '클라우드 컴퓨팅', 39000, 40, '김유리', '길벗', '2022/4/30')
    into book values ('b29', 3, '머신러닝', 40000, 30, '최영훈', '위즈덤하우스', '2022/5/20')
    into book values ('b30', 4, '모바일 앱 개발', 41000, 20, '정민주', '한빛미디어', '2022/6/15')
    into book values ('b31', 5, '게임 개발', 42000, 10, '김수진', '사이언스북스', '2022/7/10')
    into book values ('b32', 1, '프로그래밍 언어 개론', 43000, 25, '김찬우', '프리렉', '2022/8/05')
    into book values ('b33', 2, 'UI/UX 디자인', 44000, 15, '박상우', '민음사', '2022/9/01')
    into book values ('b34', 3, '빅데이터 분석', 45000, 5, '이재영', '길벗', '2022/10/30')
    into book values ('b35', 4, 'IoT 프로그래밍', 46000, 35, '정다영', '위즈덤하우스', '2022/11/15')
    into book values ('b36', 5, '블록체인 기술', 47000, 45, '김영희', '한빛미디어', '2022/12/25')
    into book values ('b37', 1, '데이터 시각화', 48000, 55, '이정민', '사이언스북스', '2023/1/10')
    into book values ('b38', 2, '파이썬 웹 개발', 49000, 65, '최명호', '프리렉', '2023/2/28')
    into book values ('b39', 3, '프로그래밍 패러다임', 50000, 75, '홍길동', '길벗', '2023/3/15')
    into book values ('b40', 4, '경량화 프로그래밍', 51000, 85, '김유진', '위즈덤하우스', '2023/4/20')
    into book values ('b41', 5, '인공지능의 이해', 52000, 95, '이상엽', '한빛미디어', '2023/5/30')
    into book values ('b42', 1, '사물인터넷', 53000, 105, '김소연', '사계절', '2023/6/25')
    into book values ('b43', 2, 'JAVA 기본서', 54000, 115, '박지영', '한빛미디어', '2023/7/15')
    into book values ('b44', 3, 'CSS 레이아웃', 55000, 125, '정현우', '길벗', '2023/8/10')
    into book values ('b45', 4, 'PHP 프로그래밍', 56000, 135, '이수환', '위즈덤하우스', '2023/9/05')
    into book values ('b46', 5, 'RUBY ON RAILS', 57000, 145, '김지민', '한빛미디어', '2023/10/10')
    into book values ('b47', 1, '데이터베이스 설계', 58000, 155, '정미래', '사이언스북스', '2023/11/15')
    into book values ('b48', 2, '자바스크립트 심화', 59000, 165, '최다빈', '프리렉', '2023/12/20')
    into book values ('b49', 3, 'FLUTTER 개발', 60000, 175, '이상우', '길벗', '2023/1/25')
    into book values ('b50', 4, 'REACT NATIVE', 61000, 185, '김태희', '위즈덤하우스', '2023/2/10')
    
 select * from dual;
 commit;
 -- 여기까지 책
 
-- 문구_카테고리
insert all 
    into sup_cate values (101,'다이어리/스케줄러')
    into sup_cate values (102,'캘린더')
    into sup_cate values (103,'고급비즈니스 문구')
    into sup_cate values (104,'스터디플래너/컨셉북')
    into sup_cate values (105,'노트')
    into sup_cate values (106,'파일/바인더')
    into sup_cate values (107,'메모용품')
    into sup_cate values (108,'사무/학습용품')
    into sup_cate values (109,'스티커/테잎')
    into sup_cate values (110,'카드/편지/엽서')
    into sup_cate values (111,'선물포장용품')
    into sup_cate values (112,'데스크용품/지구본')
    into sup_cate values (113,'문구세트')
    into sup_cate values (114,'기타문구')
    into sup_cate values (115,'필기구')
    into sup_cate values (116,'고급필기구/만년필')
    into sup_cate values (117,'미술용품')
    into sup_cate values (118,'필통/파우치') select * from dual;
    

-- 문구 into supplies values ('문구id',카테고리 숫자 100,'이름',가격,상품수량,'브랜드')
    -- 문구 데이터 삽입 (50개)
insert all
    into supplies values ('S1',101,'행운의 스터디플래너',6200,100,'칠삼이일')
    into supplies values ('S2',101,'2025년 데일리 다이어리',8900,150,'모닝글로리')
    into supplies values ('S3',101,'심플한 스케줄러',7500,80,'더페이퍼랩')
    into supplies values ('S4',102,'2025 벽걸이 캘린더',12000,60,'디자인공간')
    into supplies values ('S5',102,'한달 계획 캘린더',6500,200,'아트박스')
    into supplies values ('S6',103,'고급 가죽 명함지갑',25000,40,'몽블랑')
    into supplies values ('S7',103,'비즈니스 노트 세트',18000,90,'펜텔')
    into supplies values ('S8',104,'스터디 타이머 플래너',9900,110,'스터디메이트')
    into supplies values ('S9',104,'공부 습관 노트',5700,130,'두근두근스쿨')
    into supplies values ('S10',105,'A5 무지 노트',4500,300,'모닝글로리')
    into supplies values ('S11',105,'양장형 노트 200p',9800,150,'아트박스')
    into supplies values ('S12',106,'4링 바인더 파일',7200,180,'더페이퍼랩')
    into supplies values ('S13',106,'투명 파일 홀더',3500,220,'디자인공간')
    into supplies values ('S14',107,'접착 메모지 세트',5900,250,'3M')
    into supplies values ('S15',107,'귀여운 캐릭터 메모지',3200,300,'카카오프렌즈')
    into supplies values ('S16',108,'책상 정리 트레이',15000,70,'무인양품')
    into supplies values ('S17',108,'멀티 펜꽂이',8700,120,'모닝글로리')
    into supplies values ('S18',109,'데코 스티커 세트',4200,260,'핑크풋')
    into supplies values ('S19',109,'마스킹 테이프 3종',5800,190,'아트박스')
    into supplies values ('S20',110,'감성 엽서 10종',6200,150,'더페이퍼랩')
    into supplies values ('S21',110,'핸드메이드 편지지',9900,90,'아트박스')
    into supplies values ('S22',111,'선물 포장 리본',4200,300,'디자인공간')
    into supplies values ('S23',111,'고급 크라프트 포장지',7200,180,'더페이퍼랩')
    into supplies values ('S24',112,'미니 지구본',12000,80,'모닝글로리')
    into supplies values ('S25',112,'책상용 시계',15000,70,'무인양품')
    into supplies values ('S26',113,'학교 준비 문구세트',16500,50,'아트박스')
    into supplies values ('S27',113,'캐릭터 문구 패키지',9800,100,'핑크풋')
    into supplies values ('S28',114,'수제 노트북 스탠드',32000,30,'디자인공간')
    into supplies values ('S29',114,'DIY 미니어처 키트',28000,40,'더페이퍼랩')
    into supplies values ('S30',115,'0.5mm 샤프펜슬',5900,200,'모닝글로리')
    into supplies values ('S31',115,'수성펜 12색 세트',12000,110,'펜텔')
    into supplies values ('S32',116,'만년필 세트 (잉크 포함)',45000,50,'몽블랑')
    into supplies values ('S33',116,'고급 수제 볼펜',35000,60,'파카')
    into supplies values ('S34',117,'전문가용 수채화 붓',22000,70,'신한화구')
    into supplies values ('S35',117,'아크릴 물감 세트',15000,90,'홀베인')
    into supplies values ('S36',118,'가죽 필통',9900,130,'모닝글로리')
    into supplies values ('S37',118,'귀여운 캐릭터 파우치',8700,120,'카카오프렌즈')
    into supplies values ('S38',105,'모눈 노트 A5',5200,180,'더페이퍼랩')
    into supplies values ('S39',102,'탁상용 캘린더 2025',9500,110,'디자인공간')
    into supplies values ('S40',107,'미니 떡메모지',2900,320,'핑크풋')
    into supplies values ('S41',108,'독서대 (각도 조절 가능)',25000,50,'무인양품')
    into supplies values ('S42',109,'홀로그램 스티커팩',7500,150,'더페이퍼랩')
    into supplies values ('S43',110,'한정판 크리스마스 카드',8800,90,'디자인공간')
    into supplies values ('S44',115,'프리미엄 젤펜 5종',9900,100,'펜텔')
    into supplies values ('S45',116,'스페셜 에디션 만년필',68000,30,'몽블랑')
    into supplies values ('S46',117,'전문가용 색연필 24색',19800,80,'홀베인')
    into supplies values ('S47',118,'방수 파우치',13500,110,'무인양품')
    into supplies values ('S48',113,'디즈니 문구 세트',18500,60,'핑크풋')
    into supplies values ('S49',111,'친환경 선물 포장지',7800,140,'디자인공간')
    into supplies values ('S50',112,'책상용 미니 선풍기',25000,50,'무인양품')
select * from dual;
--여기까지 문구
 
insert into REVIEW
values (1, 'BK_B5', 'A0001', '백년의 고독', '생각보다 재미있었습니다', 10,
        to_date('17-02-2025', 'dd-mm-yyyy'));
insert into review
values (2, 'BK_B5', 'A0002', '백년의 고독', '소유하지 않는것에 대해 생각해보았습니다', 9,
        to_date('17-02-2025', 'dd-mm-yyyy'));
insert into review
values (3, 'BK_B5', 'A0003', '백년의 고독', '살면서 한번쯤 봐야하는 책', 10,
        to_date('17-02-2025', 'dd-mm-yyyy'));
insert into review
values (4, 'BK_B5', 'A0004', '백년의 고독', '법정스님이 생각하는 삶의 지혜에 대해 알게되었습니다', 9,
        to_date('17-02-2025', 'dd-mm-yyyy'));
insert into review
values (5, 'BK_B5', 'A0005', '백년의 고독', '너무 지루하고 재미가 없어요', 4,
        to_date('18-02-2025', 'dd-mm-yyyy'));
insert into review
values (6, 'BK_B5', 'A0006', '백년의 고독', '책을 읽을때 마다 마음이 안정됩니다', 10,
        to_date('18-02-2025', 'dd-mm-yyyy'));
insert into review
values (7, 'BK_B7', 'A0007', '총균쇠', '우리나라에도 노벨상 수상자가 나와서 기쁘네요', 10,
        to_date('18-02-2025', 'dd-mm-yyyy'));
insert into review
values (8, 'BK_B9', 'A0008', '여행의 기술', '흡입력 있는 내용, 문체가 신선합니다', 9,
        to_date('18-02-2025', 'dd-mm-yyyy'));
insert into review
values (9, 'BK_B9', 'A0008', '여행의 기술', '재밌게 읽긴 했는데 내용이 불편하네요', 8,
        to_date('18-02-2025', 'dd-mm-yyyy'));
insert into review
values (10, 'BK_B11', 'A0009', '리액트 입문', '굉장히 재밌게 읽었습니다', 8,
        to_date('18-02-2025', 'dd-mm-yyyy'));
insert into review
values (11, 'BK_B14', 'A0010', '자바스크립트 완벽 가이드', '재밌었어요', 9,
        to_date('18-02-2025', 'dd-mm-yyyy'));
insert into review
values (12, 'BK_B15', 'A0011', 'C# 프로그래밍', '시적 은유를 사용한 간결한 문체로 부담없이 읽을수 있었습니다', 6,
        to_date('18-02-2025', 'dd-mm-yyyy'));
commit;

insert into review_comment
values ('tifani', 'A0002', 1, '전 지루했어요',
        to_date('17-02-2025', 'dd-mm-yyyy'));
insert into review_comment
values ('rome', 'A0003', 1, '사람마다 느끼는게 다른듯',
        to_date('17-02-2025', 'dd-mm-yyyy'));
insert into review_comment
values ('dokyo', 'A0006', 7, '노벨평화상이후에 첫 수상자',
        to_date('18-02-2025', 'dd-mm-yyyy'));
insert into review_comment
values ('seoul', 'A0009', 9, '이게재밌다구요?',
        to_date('18-02-2025', 'dd-mm-yyyy'));
commit;
