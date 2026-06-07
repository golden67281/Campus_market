package com.campusmarket.server.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "interests")
public class Interest {

    @Id
    private String id; // maps to _id

    private String productId;

    private String buyerId;

    private String buyerName;

    private String buyerPhone;

    private String buyerArea;

    private String message;

    private boolean contactRevealed;

    private String createdAt;
}
