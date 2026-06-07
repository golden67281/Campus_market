package com.campusmarket.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    private String name;
    private String username;
    private String mobile;
    private String college;
    private String city;
    private String collegeEmail;
    private String collegeEmailVerified; // String "true" or "false" from frontend FormData
    private String year;
    private String department;
    private String area;
    private String lat;
    private String lng;
    private String password;
    private String securityQuestion;
    private String securityAnswer;
}
