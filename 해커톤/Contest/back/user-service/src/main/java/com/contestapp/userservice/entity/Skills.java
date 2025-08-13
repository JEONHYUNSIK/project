package com.contestapp.userservice.entity;

import jakarta.persistence.*;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "skills", schema = "user_service")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Skills {
   
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "int")
    private int id;

    @Column
    private String name;

    @Column
    private String category;
    
    @Column
    private String description;    

    @Builder
    public Skills(int id, String name, String cartegory, String description) {

        this.id = id;
        this.name = name;
        this.category = cartegory;
        this.description = description;       
    }


}