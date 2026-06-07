package com.campusmarket.server.repository;

import com.campusmarket.server.model.Product;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findBySellerIdAndStatusNot(String sellerId, String status);
    List<Product> findByStatus(String status);
    List<Product> findBySellerId(String sellerId);
}
