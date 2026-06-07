package com.campusmarket.server.repository;

import com.campusmarket.server.model.Chat;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatRepository extends MongoRepository<Chat, String> {
    List<Chat> findByProductId(String productId);
    List<Chat> findBySenderIdOrReceiverId(String senderId, String receiverId);

    @Query("{$or: [{productId: ?0, senderId: ?1, receiverId: ?2}, {productId: ?0, senderId: ?2, receiverId: ?1}]}")
    List<Chat> findChatRoomMessages(String productId, String user1, String user2);
}
