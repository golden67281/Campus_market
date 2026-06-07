package com.campusmarket.server.repository;

import com.campusmarket.server.model.Interest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InterestRepository extends MongoRepository<Interest, String> {
    List<Interest> findByBuyerId(String buyerId);
    List<Interest> findByProductId(String productId);
    Optional<Interest> findByProductIdAndBuyerId(String productId, String buyerId);
}
