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
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id; // maps to _id

    private String userId;

    private String type; // e.g. "chat_message", "buyer_interest"

    private String title;

    private String body;

    private String relatedProductId;

    private String relatedUserId;

    private boolean read;

    private String createdAt;
}
