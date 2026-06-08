package com.campusmarket.server.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonAlias;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "wishlist")
public class Wishlist {

    @Id
    @JsonProperty("id")
    @JsonAlias("_id")
    private String id; // maps to _id

    private String userId;

    private String productId;

    private String savedAt;

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id;
    }
}
