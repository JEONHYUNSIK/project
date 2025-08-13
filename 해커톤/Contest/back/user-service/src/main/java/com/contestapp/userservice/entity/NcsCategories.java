package com.contestapp.userservice.entity;

import jakarta.persistence.*;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ncs_categories", schema = "user_service")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class NcsCategories {
   /*
   SELECT id, code, name, parent_code, level, description
	FROM user_service.ncs_categories;
     */
    @Id
    @GeneratedValue
    @Column(columnDefinition = "int")
    private int id;

    @Column
    private String code;

    @Column
    private String name;
    
    @Column
    private String creaparentCodetedAt;    

    @Column
    private String level;  

    @Column
    private String description;  

    @Builder
    public NcsCategories(int id, String code, String name, String creaparentCodetedAt, String level, String description) {

        this.id = id;
        this.code = code;
        this.name = name;
        this.creaparentCodetedAt = creaparentCodetedAt;      
        this.level = level;  
        this.description = description;   
    }


}