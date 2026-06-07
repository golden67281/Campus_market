package com.campusmarket.server.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {

    @Id
    private String id; // maps to _id

    private String sellerId;

    private String title;

    private String category;

    private String subCategory;

    private String condition;

    private Double price;

    private boolean isNegotiable;

    private boolean isFree;

    private String description;

    private List<String> images;

    private List<String> tags;

    private String location;

    private String meetingSpot;

    private Double lat;

    private Double lng;

    private String college;

    private String city;

    private String status; // e.g. "active", "sold", "deleted"

    private Integer views;

    private Integer wishlistCount;

    private Integer interestCount;

    private String createdAt;

    private String expiresAt;

    private SellerInfo seller;

    @Transient
    private Map<String, Object> userContact;
}
