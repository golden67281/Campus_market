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
@Document(collection = "interests")
public class Interest {

    @Id
    @JsonProperty("id")
    @JsonAlias("_id")
    private String id; // maps to _id

    private String productId;

    private String buyerId;

    private String buyerName;

    private String buyerPhone;

    private String buyerArea;

    private String message;

    private boolean contactRevealed;

    private String createdAt;

    @JsonProperty("_id")
    public String getUnderscoreId() {
        return id;
    }
}
