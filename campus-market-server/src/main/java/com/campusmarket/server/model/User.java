package com.campusmarket.server.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonIgnore;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    @JsonProperty("id")
    @JsonAlias("_id")
    private String id; // maps to _id

    private String name;

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true)
    private String mobile;

    private String email;

    private String collegeEmail;

    private boolean collegeEmailVerified;

    private String college;

    private String collegeCity;

    private String city;

    private String year;

    private String department;

    private String area;

    private Double lat;

    private Double lng;

    private String avatar;

    @JsonIgnore
    private String password;

    private String securityQuestion;

    @JsonIgnore
    private String securityAnswer;

    private String role; // e.g. "user", "admin"

    private String status; // e.g. "active", "inactive"

    private String createdAt;

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id;
    }
}
