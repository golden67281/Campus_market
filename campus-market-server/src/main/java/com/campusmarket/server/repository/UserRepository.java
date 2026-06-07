package com.campusmarket.server.repository;

import com.campusmarket.server.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    Optional<User> findByMobile(String mobile);
    Optional<User> findByEmail(String email);
    Optional<User> findByCollegeEmail(String collegeEmail);
    boolean existsByUsername(String username);
    boolean existsByMobile(String mobile);
}
