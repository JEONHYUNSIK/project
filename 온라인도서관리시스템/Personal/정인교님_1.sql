--제약
ALTER TABLE product
    ADD CONSTRAINT CHK_Product_Type CHECK (
        (sup_id IS NOT NULL AND bk_id IS NULL) OR
        (sup_id IS NULL AND bk_id IS NOT NULL)
        );

--치환 트리거
CREATE OR REPLACE TRIGGER trg_after_insert_book
    AFTER INSERT ON book
    FOR EACH ROW
BEGIN
    INSERT INTO product (pro_id, bk_id, sup_id, pro_grade)
    VALUES ('BK_' || :NEW.bk_id, :NEW.bk_id, NULL, NULL);
END;
/

CREATE OR REPLACE TRIGGER trg_after_insert_supplies
    AFTER INSERT ON supplies
    FOR EACH ROW
BEGIN
    INSERT INTO product (pro_id, sup_id, bk_id, pro_grade)
    VALUES ('SUP_' || :NEW.sup_id, :NEW.sup_id, NULL, NULL);
END;
/

commit;
