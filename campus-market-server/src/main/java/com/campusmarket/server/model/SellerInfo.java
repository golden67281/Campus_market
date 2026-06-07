package com.campusmarket.server.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerInfo {
    private String id; // maps to user _id
    private String name;
    private String username;
    private String mobile;
    private String email;
    private String collegeEmail;
    private boolean collegeEmailVerified;
    private String college;
    private String collegeCity;
    private String year;
    private String department;
    private String area;
    private Double lat;
    private Double lng;
    private String avatar;
    private String role;
    private String status;
    private String createdAt;
    private String city;
}
