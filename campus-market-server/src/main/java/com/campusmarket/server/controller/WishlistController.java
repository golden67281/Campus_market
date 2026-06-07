package com.campusmarket.server.controller;

import com.campusmarket.server.model.*;
import com.campusmarket.server.repository.*;
import com.campusmarket.server.security.UserPrincipal;
import com.campusmarket.server.utils.ImageHelper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getWishlist(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {

        List<Wishlist> userWishlist = wishlistRepository.findByUserId(userPrincipal.getId());
        List<Map<String, Object>> response = new ArrayList<>();

        for (Wishlist item : userWishlist) {
            Optional<Product> prodOpt = productRepository.findById(item.getProductId());
            if (prodOpt.isEmpty() || "deleted".equalsIgnoreCase(prodOpt.get().getStatus())) {
                continue;
            }

            Product product = prodOpt.get();

            // Populate safe seller details
            Optional<User> sellerOpt = userRepository.findById(product.getSellerId());
            if (sellerOpt.isPresent()) {
                User seller = sellerOpt.get();
                SellerInfo safeSeller = SellerInfo.builder()
                        .id(seller.getId())
                        .name(seller.getName())
                        .username(seller.getUsername())
                        .college(seller.getCollege())
                        .avatar(ImageHelper.normalizeUser(seller, request).getAvatar())
                        .collegeEmailVerified(seller.isCollegeEmailVerified())
                        .build();
                product.setSeller(safeSeller);
            }

            Product normalized = ImageHelper.normalizeProduct(product, request);

            Map<String, Object> map = new HashMap<>();
            map.put("_id", item.getId());
            map.put("id", item.getId());
            map.put("userId", item.getUserId());
            map.put("productId", item.getProductId());
            map.put("savedAt", item.getSavedAt());
            map.put("product", normalized);

            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{productId}")
    public ResponseEntity<?> addToWishlist(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("productId") String productId) {

        Optional<Product> prodOpt = productRepository.findById(productId);
        if (prodOpt.isEmpty() || !"active".equalsIgnoreCase(prodOpt.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Active product not found"));
        }

        String userId = userPrincipal.getId();
        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndProductId(userId, productId);

        Wishlist item;
        if (existing.isEmpty()) {
            item = Wishlist.builder()
                    .id("w_" + System.currentTimeMillis() + "_" + (int) (Math.random() * 10000))
                    .userId(userId)
                    .productId(productId)
                    .savedAt(Instant.now().toString())
                    .build();
            wishlistRepository.save(item);

            // Increment wishlist count on product
            Product product = prodOpt.get();
            product.setWishlistCount((product.getWishlistCount() != null ? product.getWishlistCount() : 0) + 1);
            productRepository.save(product);
        } else {
            item = existing.get();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromWishlist(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("productId") String productId) {

        String userId = userPrincipal.getId();
        Optional<Wishlist> existing = wishlistRepository.findByUserIdAndProductId(userId, productId);

        if (existing.isPresent()) {
            wishlistRepository.delete(existing.get());

            // Decrement wishlist count on product
            Optional<Product> prodOpt = productRepository.findById(productId);
            if (prodOpt.isPresent()) {
                Product product = prodOpt.get();
                product.setWishlistCount(Math.max(0, (product.getWishlistCount() != null ? product.getWishlistCount() : 0) - 1));
                productRepository.save(product);
            }
        }

        return ResponseEntity.ok(Map.of("message", "Removed from wishlist successfully"));
    }
}
