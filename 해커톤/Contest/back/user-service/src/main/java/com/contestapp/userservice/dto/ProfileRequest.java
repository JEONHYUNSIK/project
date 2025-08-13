package com.contestapp.userservice.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileRequest {   

    @NotBlank(message = "User ID is required")
    @Size(min = 1, message = "User ID must be a valid number")
    private String userId;
    
    //@NotBlank(message = "Full name is required")
    private String fullName;
    
    //@NotBlank(message = "Bio is required")
    @Size(max = 500, message = "Bio must be less than 500 characters")
    private String bio;
    
   // @NotBlank(message = "Profile image URL is required")
    @Size(max = 255, message = "Profile image URL must be less than 255 characters")
    private String profileImageUrl;

    //@NotBlank(message = "Education is required")
    private String education;

   //@NotBlank(message = "Experience is required")
    private String experience;

    //@NotBlank(message = "Portfolio URL is required")
    @Size(max = 255, message = "Portfolio URL must be less than 255 characters")    
    private String portfolioUrl;
} 