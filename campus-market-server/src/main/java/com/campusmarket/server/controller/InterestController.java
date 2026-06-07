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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/interests")
public class InterestController {

    @Autowired
    private InterestRepository interestRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @PostMapping
    public ResponseEntity<?> expressInterest(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> body) {

        String productId = body.get("productId");
        String buyerName = body.get("buyerName");
        String buyerPhone = body.get("buyerPhone");
        String buyerArea = body.get("buyerArea");
        String message = body.get("message");
        String buyerId = userPrincipal.getId();

        if (productId == null || productId.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Product ID is required"));
        }

        Optional<Product> prodOpt = productRepository.findById(productId);
        if (prodOpt.isEmpty() || "deleted".equalsIgnoreCase(prodOpt.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Product listing not found"));
        }

        Product product = prodOpt.get();

        if (product.getSellerId().equals(buyerId)) {
            return ResponseEntity.badRequest().body(Map.of("message", "You cannot contact yourself on your own listing."));
        }

        Optional<Interest> existing = interestRepository.findByProductIdAndBuyerId(productId, buyerId);

        Interest interest;
        if (existing.isEmpty()) {
            Optional<User> buyerOpt = userRepository.findById(buyerId);
            String resolvedBuyerName = buyerName;
            if (resolvedBuyerName == null || resolvedBuyerName.trim().isEmpty()) {
                if (buyerOpt.isPresent()) {
                    resolvedBuyerName = buyerOpt.get().getName() != null ? buyerOpt.get().getName() : buyerOpt.get().getUsername();
                } else {
                    resolvedBuyerName = "A student";
                }
            }

            interest = Interest.builder()
                    .id("i_" + System.currentTimeMillis() + "_" + (int) (Math.random() * 10000))
                    .productId(productId)
                    .buyerId(buyerId)
                    .buyerName(resolvedBuyerName)
                    .buyerPhone(buyerPhone != null ? buyerPhone : "")
                    .buyerArea(buyerArea != null ? buyerArea : "")
                    .message(message != null ? message : "")
                    .contactRevealed(false)
                    .createdAt(Instant.now().toString())
                    .build();

            interestRepository.save(interest);

            // Increment interest count
            product.setInterestCount((product.getInterestCount() != null ? product.getInterestCount() : 0) + 1);
            productRepository.save(product);

            // Create notification for seller
            Notification notification = Notification.builder()
                    .id("n_" + System.currentTimeMillis() + "_" + (int) (Math.random() * 10000))
                    .userId(product.getSellerId())
                    .type("buyer_interest")
                    .title(resolvedBuyerName + " is interested in your " + product.getTitle())
                    .body(message != null && !message.trim().isEmpty() ? message : "Is this still available?")
                    .relatedProductId(productId)
                    .relatedUserId(buyerId)
                    .read(false)
                    .createdAt(Instant.now().toString())
                    .build();

            notificationRepository.save(notification);
        } else {
            interest = existing.get();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(interest);
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getMyInterests(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {

        List<Interest> myInterests = interestRepository.findByBuyerId(userPrincipal.getId());
        List<Map<String, Object>> response = new ArrayList<>();

        for (Interest i : myInterests) {
            Optional<Product> prodOpt = productRepository.findById(i.getProductId());
            Product product = prodOpt.map(p -> ImageHelper.normalizeProduct(p, request)).orElse(null);

            Map<String, Object> map = new HashMap<>();
            map.put("_id", i.getId());
            map.put("id", i.getId());
            map.put("productId", i.getProductId());
            map.put("buyerId", i.getBuyerId());
            map.put("buyerName", i.getBuyerName());
            map.put("buyerPhone", i.getBuyerPhone());
            map.put("buyerArea", i.getBuyerArea());
            map.put("message", i.getMessage());
            map.put("contactRevealed", i.isContactRevealed());
            map.put("createdAt", i.getCreatedAt());
            map.put("product", product);

            response.add(map);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductInterests(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("productId") String productId) {

        Optional<Product> prodOpt = productRepository.findById(productId);
        if (prodOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Product not found"));
        }

        Product product = prodOpt.get();
        if (!product.getSellerId().equals(userPrincipal.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Unauthorized. You are not the seller."));
        }

        List<Interest> productInterests = interestRepository.findByProductId(productId);
        return ResponseEntity.ok(productInterests);
    }

    @GetMapping("/contact/{productId}")
    public ResponseEntity<?> getSellerContact(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("productId") String productId) {

        String buyerId = userPrincipal.getId();
        Optional<Interest> interestOpt = interestRepository.findByProductIdAndBuyerId(productId, buyerId);

        if (interestOpt.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please express interest first before fetching contact details."));
        }

        Interest interest = interestOpt.get();
        if (!interest.isContactRevealed()) {
            interest.setContactRevealed(true);
            interestRepository.save(interest);
        }

        Optional<Product> prodOpt = productRepository.findById(productId);
        if (prodOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Product listing not found"));
        }
        Product product = prodOpt.get();

        Optional<User> sellerOpt = userRepository.findById(product.getSellerId());
        if (sellerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Seller not found"));
        }
        User seller = sellerOpt.get();

        Map<String, Object> sellerMap = new HashMap<>();
        sellerMap.put("_id", seller.getId());
        sellerMap.put("name", seller.getName());
        sellerMap.put("avatar", seller.getAvatar());
        sellerMap.put("college", seller.getCollege());
        sellerMap.put("verified", seller.isCollegeEmailVerified());

        Map<String, Object> response = new HashMap<>();
        response.put("phone", seller.getMobile());
        response.put("meetingSpot", product.getMeetingSpot() != null && !product.getMeetingSpot().isEmpty() ?
                product.getMeetingSpot() : (seller.getArea() != null ? seller.getArea() : ""));
        response.put("seller", sellerMap);

        return ResponseEntity.ok(response);
    }
}
