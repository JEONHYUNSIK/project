-- 출판사이름을 매개변수로 입력받아 해당 출판사의 책중 최대가격을 출력하는 프로시저(책이름, 가격)

create or replace procedure bk_maxprice_p (
    p_bkpub in book.bk_pub%type
) is
    v_bk_price book.bk_price%type;
    v_bk_name book.bk_name%type;
begin
    select bk_price, bk_name into v_bk_price, v_bk_name
        from book where bk_pub=p_bkpub 
        and bk_price =(select max(bk_price) from book where bk_pub=p_bkpub);
    dbms_output.put_line
    (p_bkpub || '출판사의 도서 '||v_bk_name||'의 최대가격:'|| v_bk_price);

END;
/

accept p_bkpublic prompt '검색할 출판사를 입력하세요'
exec bk_maxprice_p('&p_bkpublic');