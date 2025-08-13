 --프로젝트 북스토어현식기능.sql
 --일반적인 검색--
 set serveroutput on;
 select * from book; 
 select * from product;
 select * from review;
 select * from review_comment;
 --기본검색--
 --책의가격이 60000 이상인 책의 도서번호,책이름,가격,저자,출판사 검색
 select bk_id "도서번호",bk_name "책이름",bk_price"책가격",bk_author"저자",bk_pub"출판사" from book
 where bk_price >= 60000;
 
 --출판일이 2023년도에 나온 책의 도서번호,책이름,저자,출판사,출판일 검색
 select bk_id "도서번호",bk_name "책이름",bk_price"책가격",bk_author"저자",bk_pub"출판사",bk_published "출판일" from book 
 WHERE 
    to_date(bk_published, 'YY/MM/DD') between to_date('23/01/01', 'YY/MM/DD') and to_date('23/12/31', 'YY/MM/DD')
    order by 
    to_date(bk_published, 'YY/MM/DD');
-- 그룹 --
-- 책의 카테고리별로 재고량 평균 검색 --
select cate_id "카테고리", round(avg(bk_quantity)) from book
    group by cate_id;
-- 카테고리별로 책번호,재고량,책가격 총합계금액 검색--
select cate_id "카테고리", bk_id "책번호", sum(bk_quantity) "재고량", sum(bk_price) "총합계금액" from book 
    group by cate_id, bk_id order by  cate_id, bk_id;
    

-- 조인 --
-- equi join (동등 조언): equal (=)연산자를 사용하는 조언
select * from book,bk_cate
 where book.cate_id = bk_cate.cate_id;

-- equi join 사용해서 카테고리 도서번호, 책이름, 책가격, 저자, 출판사 검색 
select cate "카테고리" ,bk_id "도서번호",bk_name "책이름",bk_price"책가격",bk_author"저자",bk_pub"출판사"  from book,bk_cate
 where book.cate_id = bk_cate.cate_id;
 
-- 서브쿼리 --
-- 1.도서번호가 b8번인 책과 카테고리가번호가 같은 책의이름,재고량 출력
   select bk_name,bk_quantity from book
   where cate_id=(select cate_id from book where bk_id = 'b8');
-- 2.도서번호가 b40번인 책보다 가격이 비싼 책의 이름,출판사,가격 출력
   select bk_name,bk_pub,bk_price from book
   where bk_price >(select bk_price from book where bk_id='b40');
-- 3.가장비싼가격의책,가장싼책의 책이름,카테고리번호,카테고리,책가격 출력
   select b.bk_name "책이름", b.cate_id "카테고리번호", c.cate "카테고리", b.bk_price "책가격"
   from book b 
   join bk_cate c on b.cate_id = c.cate_id 
   where b.bk_price=(select min(bk_price) from book)
      or b.bk_price=(select max(bk_price) from book);
--4.출판사가 길벗이 아니면서 책의가격이 모든 머신러닝보다 낮은 도서번호,책이름,가격,책재고량 검색 all은 최소값기준
select bk_id "도서번호", bk_name "책이름", bk_price "책가격", bk_quantity "책재고량" from book where bk_price <
    all(select bk_price from book where bk_name='머신러닝')
    and bk_pub <> '길벗';
--5.출판사가 길벗이 아니면서 책의가격이 모든 머신러닝보다 낮은 도서번호,책이름,가격,책재고량 검색 any은 최소값기준   
select bk_id "도서번호", bk_name "책이름", bk_price "책가격", bk_quantity "책재고량" from book where bk_price <
    any(select bk_price from book where bk_name='머신러닝')
    and bk_pub <> '길벗';    
--6. 카테고리별 책값이 가장싼 책의 도서번호, 책이름,카테고리번호,카테고리 검색
select b.bk_id, b.bk_name, b.bk_price, c.cate_id,c.cate 
from book b join bk_cate c on b.cate_id = c.cate_id 
    where bk_price in (select min(bk_price) from book group by bk_id);    





--커서를 이용해서 책의가격이 20000보다 비싸고 카테고리가번호가 1번인 책의 도서번호,책이름,가격,재고량,저자 나오게
 declare
     -- 일반 변수 선언 영역
 begin
     for book_row in(select * from book where cate_id =1) 
     loop
      if book_row.bk_name = '웹 개발의 정석' then
      dbms_output.put_line('이벤트에 당첨되었습니다');
      end if;
      if book_row.bk_price > 20000 then
            dbms_output.put_line(book_row.bk_id || ':' || 
                book_row.bk_name || ':' || book_row.bk_price 
                || ':' ||book_row.bk_quantity
                || ':' ||book_row.bk_author
                );
        end if;
    end loop;
end;
/

--프로시저,함수등을하여 검색,입력,수정,삭제 구현
-- 테스트 코드
select bk_id, bk_name, bk_price from book where bk_id='b21';
--1. 프로시저: 프로그래밍에서 return이 없는 함수
create or replace procedure book_info_b (
    b_bookid in book.bk_id%type --매개변수
) is
    v_bki book.bk_id%type;  --일반변수
    v_bkp book.bk_price%type; --일반변수
    v_bkname book.bk_name%type; --일반변수
begin
    select bk_id, bk_name, bk_price into v_bki,v_bkname, v_bkp --데이터를 변수에 저장
        from book where bk_id=b_bookid;
    dbms_output.put_line('도서번호:' || v_bki);
    dbms_output.put_line('책이름:' || v_bkname);
    dbms_output.put_line('책가격:' || v_bkp);
exception
    when others then
        -- sqlcode:에러 코드, sqlerrm:에러 메시지
        dbms_output.put_line(sqlcode || sqlerrm);
end;
/
--문자타입은 ' '넣어야함
-- 프로시저 호출(사용)
accept b_bookid prompt '검색할 도서번호를 입력하세요'
exec book_info_b('&b_bookid'); 

-- 2.카테고리번호를 매개변수로 입력받아 해당 같은카테고리 도서중 의 최대가격을 출력하는 프로시저
create or replace procedure book_maxprice_p (
    b_cate_id in book.cate_id%type
) is
    b_pr book.bk_price%type;
begin
    select max(bk_price) into b_pr
        from book where cate_id=b_cate_id;
    dbms_output.put_line(b_cate_id || '번 카테고리의 최대가격:' || b_pr);
end;
/
accept b_cate_id prompt '검색할 책의 카테고리번호를 입력하세요'
exec book_maxprice_p(&b_cate_id);

--3.책의 카테고리 번호를 매개변수로 입력받아 도서번호,책이름,저자,출판일 가격을 출력하는 프로시저
select bk_id, bk_name,book.bk_author,bk_published,bk_price from book
 where cate_id=4;
 
create or replace procedure book_samecate_id_p (
    p_bkpcate_id in book.cate_id%type
) is
    -- 일반 변수 선언 영역
begin
    for book_buf in (select bk_id, bk_name,book.bk_author,bk_published,bk_price 
        from book where cate_id=p_bkpcate_id)
    loop
        dbms_output.put_line('도서번호: ' || book_buf.bk_id);
        dbms_output.put_line('책이름: ' || book_buf.bk_name);
        dbms_output.put_line('저자: ' || book_buf.bk_author);
        dbms_output.put_line('출판일: ' || book_buf.bk_published);
        dbms_output.put_line('책가격: ' || book_buf.bk_price);
        dbms_output.put_line('---------------------------');
    end loop;
end;
/
accept p_cate_id prompt '검색할 책의카테고리번호를 입력하세요'
exec book_samecate_id_p(&p_cate_id); 

-- 4 책의도서번호와 책이름을 매개변수로 받아서 도서번호 또는 책이름과 일치하는 카테고리번호를
-- 구한 후 카테고리번호,책이름명, 출판일, 재고량, 책가격 출력하는 프로시저
-- 조건1) 데이터가 없으면 '검색한 데이터가 존재하지 않습니다' 오류메시지 출력
select cate_id, bk_name, bk_published, bk_quantity,bk_price  from book
    where cate_id in(select cate_id from book 
                 where bk_id='b48' or bk_name='자바스크립트 심화');
create or replace procedure book_find_p (
    p_book_bk_id in book.bk_id%type,
    p_book_name in book.bk_name%type
) is
    chkNum int := 0;
begin
    for book_buf in (
        select cate_id, bk_name, bk_published, bk_quantity,bk_price
            from book where cate_id in(
                select cate_id from book
                    where bk_id=p_book_bk_id or bk_name= p_book_name))
    loop
        dbms_output.put_line('책카테고리번호:' || book_buf.cate_id);
        dbms_output.put_line('책이름:' || book_buf.bk_name);
        dbms_output.put_line('출판일:' || book_buf.bk_published);
        dbms_output.put_line('책재고량:' || book_buf.bk_quantity);
        dbms_output.put_line('책가격:' || book_buf.bk_price);
        dbms_output.put_line('------------------------');
        chkNum := 1;
    end loop;
    if chkNum = 0 then
        dbms_output.put_line('데이터가 존재하지 않습니다');
    end if;
end;
/
exec book_find_p('b52', '모두의sql');
exec book_find_p('b1', '오라클SQL');
exec book_find_p('b53', '오라클SQL6');

-- 5.#####################################################
-- 함수(function): 프로그래밍에서 return이 있는 함수
-- 책의카테고리번호가 있는지 확인하는 함수
select count(*) from book where cate_id=6 and rownum=1;
create or replace function bk_cate_id_cnt_f (
    p_bkno book.cate_id%type
) return number is
-- 일반 변수 선언 영역
    cnt int;
begin
    select count(*) into cnt from book 
        where cate_id=p_bkno and rownum=1;
    if cnt > 0 then
        return cnt;
    else
        return 0;
    end if;
exception
    when others then
        dbms_output.put_line(sqlcode || sqlerrm);
        return -1;
end;
/
-- 함수 호출(사용)
select distinct bk_cate_id_cnt_f(6) from book;



--트리거--데이터 입력 수정 삭제
insert into book VALUES('b51',1,'오라클SQl2',24000, 200, '이지훈','이지스퍼블리싱','2021/10/30');
update book set bk_name='오라클SQl3' where bk_id = 'b51';
update book set bk_name='오라클SQl2' where bk_id = 'b51';
delete from product where bk_id = 'b51';
delete from book where bk_id = 'b51';
insert into book VALUES('b52',1,'cs의정석',24000, 200, '김수정','이지스퍼블리싱','2021/10/30');
update book set bk_name='cs의정석2' where bk_id = 'b52';
update book set bk_name='cs의정석3' where bk_id = 'b52';
delete from product where bk_id = 'b52';
delete from book where bk_id = 'b52';
insert into bk_cate values(7,'영화');
update bk_cate set cate = '범죄/스릴러'where cate_id = 7;
update bk_cate set cate = '호러/공포'where cate_id = 7;
delete from bk_cate where cate_id = 7;
update product set pro_id ='bk 52'  where bk_id = 'b51';
update product set pro_id ='bk 54'  where bk_id = 'b51';
delete from product where bk_id = 'b51';
delete from book where bk_id = 'b51';
commit;

-- 뷰 연습 --
GRANT create view to bookstore;

create or replace view myView as
select bk_name  "책이름", bk_id  "도서번호", 
    (select cate_id from book where b.bk_id=bk_id) "카테고리번호",
    (select bk_price from book where b.bk_id=bk_id) "책가격"
     from book b where
    cate_id=(select cate_id from book where bk_name='파이썬');
    
SELECT 책이름, 도서번호 FROM myView WHERE 책이름 = '리액트 입문'; 
SELECT 책이름, 도서번호,카테고리번호,책가격 FROM myView WHERE 책이름 = '파이썬'; 



