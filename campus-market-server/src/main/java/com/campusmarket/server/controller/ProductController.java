package com.campusmarket.server.controller;

import com.campusmarket.server.model.*;
import com.campusmarket.server.repository.*;
import com.campusmarket.server.security.JwtTokenProvider;
import com.campusmarket.server.security.UserPrincipal;
import com.campusmarket.server.utils.DistanceHelper;
import com.campusmarket.server.utils.ImageHelper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InterestRepository interestRepository;

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @GetMapping
    public ResponseEntity<?> getProducts(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "minPrice", required = false) Double minPrice,
            @RequestParam(value = "maxPrice", required = false) Double maxPrice,
            @RequestParam(value = "conditions", required = false) List<String> conditions,
            @RequestParam(value = "sort", required = false) String sort,
            @RequestParam(value = "lat", required = false) String latStr,
            @RequestParam(value = "lng", required = false) String lngStr,
            @RequestParam(value = "radius", required = false) String radiusStr,
            HttpServletRequest request) {

        Double lat = null;
        Double lng = null;
        Double radius = null;

        if (latStr != null && !latStr.trim().isEmpty() && !"null".equalsIgnoreCase(latStr) && !"undefined".equalsIgnoreCase(latStr)) {
            try {
                lat = Double.parseDouble(latStr);
            } catch (NumberFormatException e) {
                // ignore
            }
        }
        if (lngStr != null && !lngStr.trim().isEmpty() && !"null".equalsIgnoreCase(lngStr) && !"undefined".equalsIgnoreCase(lngStr)) {
            try {
                lng = Double.parseDouble(lngStr);
            } catch (NumberFormatException e) {
                // ignore
            }
        }
        if (radiusStr != null && !radiusStr.trim().isEmpty() && !"null".equalsIgnoreCase(radiusStr) && !"undefined".equalsIgnoreCase(radiusStr)) {
            try {
                radius = Double.parseDouble(radiusStr);
            } catch (NumberFormatException e) {
                // ignore
            }
        }

        Query query = new Query();
        query.addCriteria(Criteria.where("status").is("active"));

        if (category != null && !category.trim().isEmpty()) {
            query.addCriteria(Criteria.where("category").regex("^" + category + "$", "i"));
        }
        if (minPrice != null) {
            query.addCriteria(Criteria.where("price").gte(minPrice));
        }
        if (maxPrice != null) {
            query.addCriteria(Criteria.where("price").lte(maxPrice));
        }
        if (conditions != null && !conditions.isEmpty()) {
            query.addCriteria(Criteria.where("condition").in(conditions));
        }

        // Sorting
        if ("price_asc".equalsIgnoreCase(sort)) {
            query.with(Sort.by(Sort.Direction.ASC, "price"));
        } else if ("price_desc".equalsIgnoreCase(sort)) {
            query.with(Sort.by(Sort.Direction.DESC, "price"));
        } else if ("views".equalsIgnoreCase(sort)) {
            query.with(Sort.by(Sort.Direction.DESC, "views"));
        } else {
            // default: newest
            query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        }

        List<Product> products = mongoTemplate.find(query, Product.class);

        // Distance filter (in-memory Haversine distance)
        if (lat != null && lng != null && radius != null) {
            final Double targetLat = lat;
            final Double targetLng = lng;
            final Double targetRadius = radius;
            products = products.stream()
                    .filter(p -> p.getLat() != null && p.getLng() != null &&
                            DistanceHelper.getDistanceKm(targetLat, targetLng, p.getLat(), p.getLng()) <= targetRadius)
                    .collect(Collectors.toList());
        }

        List<Product> normalized = products.stream()
                .map(p -> ImageHelper.normalizeProduct(p, request))
                .collect(Collectors.toList());

        return ResponseEntity.ok(normalized);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchProducts(
            @RequestParam(value = "q", required = false) String q,
            HttpServletRequest request) {

        Query query = new Query();
        query.addCriteria(Criteria.where("status").is("active"));
        List<Product> products = mongoTemplate.find(query, Product.class);

        if (q != null && !q.trim().isEmpty()) {
            String term = q.toLowerCase();
            products = products.stream()
                    .filter(p -> p.getTitle().toLowerCase().contains(term) ||
                            p.getDescription().toLowerCase().contains(term) ||
                            (p.getTags() != null && p.getTags().stream().anyMatch(t -> t.toLowerCase().contains(term))))
                    .collect(Collectors.toList());
        }

        List<Product> normalized = products.stream()
                .map(p -> ImageHelper.normalizeProduct(p, request))
                .collect(Collectors.toList());

        return ResponseEntity.ok(normalized);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductDetails(
            @PathVariable("id") String id,
            HttpServletRequest request) {

        Optional<Product> prodOpt = productRepository.findById(id);
        if (prodOpt.isEmpty() || "deleted".equalsIgnoreCase(prodOpt.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Product listing not found"));
        }

        Product product = prodOpt.get();

        // Check if requester has expressed interest
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            try {
                String token = authHeader.substring(7);
                if (tokenProvider.validateToken(token)) {
                    String userId = tokenProvider.getUserIdFromJWT(token);
                    Optional<Interest> interestOpt = interestRepository.findByProductIdAndBuyerId(id, userId);
                    if (interestOpt.isPresent()) {
                        Optional<User> sellerOpt = userRepository.findById(product.getSellerId());
                        if (sellerOpt.isPresent()) {
                            User seller = sellerOpt.get();
                            Map<String, Object> contact = new HashMap<>();
                            contact.put("phone", seller.getMobile());
                            contact.put("meetingSpot", product.getMeetingSpot() != null && !product.getMeetingSpot().isEmpty() ?
                                    product.getMeetingSpot() : (seller.getArea() != null ? seller.getArea() : ""));
                            
                            Map<String, Object> safeSeller = new HashMap<>();
                            safeSeller.put("_id", seller.getId());
                            safeSeller.put("name", seller.getName());
                            safeSeller.put("avatar", seller.getAvatar());
                            safeSeller.put("college", seller.getCollege());
                            safeSeller.put("verified", seller.isCollegeEmailVerified());
                            
                            contact.put("seller", safeSeller);
                            product.setUserContact(contact);
                        }
                    }
                }
            } catch (Exception ex) {
                // Ignore token decode error for public view
            }
        }

        Product normalized = ImageHelper.normalizeProduct(product, request);
        return ResponseEntity.ok(normalized);
    }

    @PostMapping
    public ResponseEntity<?> createProduct(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Product product,
            HttpServletRequest request) {

        if (product.getTitle() == null || product.getCategory() == null || product.getCondition() == null ||
                (!product.isFree() && product.getPrice() == null)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing listing parameters"));
        }

        Optional<User> sellerOpt = userRepository.findById(userPrincipal.getId());
        if (sellerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Seller profile not found"));
        }

        User seller = sellerOpt.get();

        product.setId("p_" + System.currentTimeMillis() + "_" + (int) (Math.random() * 10000));
        product.setSellerId(seller.getId());
        product.setPrice(product.isFree() ? 0.0 : product.getPrice());
        product.setImages(product.getImages() != null ? product.getImages() : new ArrayList<>());
        product.setTags(product.getTags() != null ? product.getTags() : new ArrayList<>());
        product.setLocation(product.getLocation() != null && !product.getLocation().isEmpty() ?
                product.getLocation() : (seller.getArea() != null ? seller.getArea() : ""));
        product.setMeetingSpot(product.getMeetingSpot() != null ? product.getMeetingSpot() : "");
        product.setLat(seller.getLat());
        product.setLng(seller.getLng());
        product.setCollege(seller.getCollege());
        product.setCity(seller.getCollegeCity() != null && !seller.getCollegeCity().isEmpty() ?
                seller.getCollegeCity() : (seller.getCity() != null ? seller.getCity() : ""));
        product.setStatus("active");
        product.setViews(0);
        product.setWishlistCount(0);
        product.setInterestCount(0);
        product.setCreatedAt(Instant.now().toString());
        product.setExpiresAt(Instant.now().plus(30, ChronoUnit.DAYS).toString());

        SellerInfo sellerInfo = SellerInfo.builder()
                .id(seller.getId())
                .name(seller.getName())
                .username(seller.getUsername())
                .mobile(seller.getMobile())
                .email(seller.getEmail())
                .collegeEmail(seller.getCollegeEmail())
                .collegeEmailVerified(seller.isCollegeEmailVerified())
                .college(seller.getCollege())
                .collegeCity(seller.getCollegeCity())
                .year(seller.getYear())
                .department(seller.getDepartment())
                .area(seller.getArea())
                .lat(seller.getLat())
                .lng(seller.getLng())
                .avatar(seller.getAvatar())
                .role(seller.getRole())
                .status(seller.getStatus())
                .createdAt(seller.getCreatedAt())
                .city(seller.getCollegeCity())
                .build();
        product.setSeller(sellerInfo);

        productRepository.save(product);

        Product normalized = ImageHelper.normalizeProduct(product, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(normalized);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProduct(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") String id,
            @RequestBody Map<String, Object> updates,
            HttpServletRequest request) {

        Optional<Product> prodOpt = productRepository.findById(id);
        if (prodOpt.isEmpty() || "deleted".equalsIgnoreCase(prodOpt.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Listing not found"));
        }

        Product product = prodOpt.get();

        if (!product.getSellerId().equals(userPrincipal.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Unauthorized. You do not own this listing."));
        }

        // Apply updates while ignoring read-only parameters
        if (updates.containsKey("title")) product.setTitle((String) updates.get("title"));
        if (updates.containsKey("category")) product.setCategory((String) updates.get("category"));
        if (updates.containsKey("subCategory")) product.setSubCategory((String) updates.get("subCategory"));
        if (updates.containsKey("condition")) product.setCondition((String) updates.get("condition"));
        if (updates.containsKey("price")) product.setPrice(((Number) updates.get("price")).doubleValue());
        if (updates.containsKey("isNegotiable")) product.setNegotiable((Boolean) updates.get("isNegotiable"));
        if (updates.containsKey("isFree")) product.setFree((Boolean) updates.get("isFree"));
        if (updates.containsKey("description")) product.setDescription((String) updates.get("description"));
        if (updates.containsKey("images")) product.setImages((List<String>) updates.get("images"));
        if (updates.containsKey("tags")) product.setTags((List<String>) updates.get("tags"));
        if (updates.containsKey("location")) product.setLocation((String) updates.get("location"));
        if (updates.containsKey("meetingSpot")) product.setMeetingSpot((String) updates.get("meetingSpot"));
        if (updates.containsKey("lat")) product.setLat(((Number) updates.get("lat")).doubleValue());
        if (updates.containsKey("lng")) product.setLng(((Number) updates.get("lng")).doubleValue());
        if (updates.containsKey("college")) product.setCollege((String) updates.get("college"));
        if (updates.containsKey("city")) product.setCity((String) updates.get("city"));
        if (updates.containsKey("status")) product.setStatus((String) updates.get("status"));

        productRepository.save(product);

        Product normalized = ImageHelper.normalizeProduct(product, request);
        return ResponseEntity.ok(normalized);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") String id) {

        Optional<Product> prodOpt = productRepository.findById(id);
        if (prodOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Listing not found"));
        }

        Product product = prodOpt.get();

        if (!product.getSellerId().equals(userPrincipal.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Unauthorized. You do not own this listing."));
        }

        product.setStatus("deleted");
        productRepository.save(product);

        return ResponseEntity.ok(Map.of("message", "Listing deleted successfully"));
    }

    @PutMapping("/{id}/mark-sold")
    public ResponseEntity<?> markSold(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") String id) {

        Optional<Product> prodOpt = productRepository.findById(id);
        if (prodOpt.isEmpty() || "deleted".equalsIgnoreCase(prodOpt.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Listing not found"));
        }

        Product product = prodOpt.get();

        if (!product.getSellerId().equals(userPrincipal.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Unauthorized. You do not own this listing."));
        }

        product.setStatus("sold");
        productRepository.save(product);

        return ResponseEntity.ok(Map.of("message", "Listing marked as sold"));
    }

    @PutMapping("/{id}/renew")
    public ResponseEntity<?> renewProduct(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") String id) {

        Optional<Product> prodOpt = productRepository.findById(id);
        if (prodOpt.isEmpty() || "deleted".equalsIgnoreCase(prodOpt.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Listing not found"));
        }

        Product product = prodOpt.get();

        if (!product.getSellerId().equals(userPrincipal.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", "Unauthorized. You do not own this listing."));
        }

        product.setExpiresAt(Instant.now().plus(30, ChronoUnit.DAYS).toString());
        product.setStatus("active");
        productRepository.save(product);

        return ResponseEntity.ok(Map.of("message", "Listing renewed for 30 additional days!"));
    }

    @PostMapping("/{id}/view")
    public ResponseEntity<?> incrementView(@PathVariable("id") String id) {
        Optional<Product> prodOpt = productRepository.findById(id);
        if (prodOpt.isPresent() && "active".equalsIgnoreCase(prodOpt.get().getStatus())) {
            Product product = prodOpt.get();
            product.setViews((product.getViews() != null ? product.getViews() : 0) + 1);
            productRepository.save(product);
        }
        return ResponseEntity.ok().build();
    }
}
