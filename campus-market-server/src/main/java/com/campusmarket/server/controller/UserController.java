package com.campusmarket.server.controller;

import com.campusmarket.server.model.*;
import com.campusmarket.server.repository.*;
import com.campusmarket.server.security.UserPrincipal;
import com.campusmarket.server.service.CloudinaryService;
import com.campusmarket.server.service.EmailService;
import com.campusmarket.server.utils.ImageHelper;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private EmailService emailService;

    @GetMapping("/check-username")
    public ResponseEntity<?> checkUsername(@RequestParam("u") String username) {
        if (username == null || username.length() < 4) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username must be at least 4 characters"));
        }

        boolean exists = userRepository.existsByUsername(username.toLowerCase());
        return ResponseEntity.ok(Map.of("available", !exists));
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMe(@AuthenticationPrincipal UserPrincipal userPrincipal, HttpServletRequest request) {
        Optional<User> userOpt = userRepository.findById(userPrincipal.getId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        User user = ImageHelper.normalizeUser(userOpt.get(), request);

        // Fetch user listing stats
        List<Product> allUserProducts = productRepository.findBySellerIdAndStatusNot(user.getId(), "deleted");
        List<Product> activeProducts = allUserProducts.stream()
                .filter(p -> "active".equalsIgnoreCase(p.getStatus()))
                .collect(Collectors.toList());
        List<Product> soldProducts = allUserProducts.stream()
                .filter(p -> "sold".equalsIgnoreCase(p.getStatus()))
                .collect(Collectors.toList());

        long listingCount = activeProducts.size();
        long dealsCount = soldProducts.size();
        long totalViews = allUserProducts.stream().mapToLong(p -> p.getViews() != null ? p.getViews() : 0).sum();

        List<Product> recentListings = activeProducts.stream()
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .map(p -> ImageHelper.normalizeProduct(p, request))
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("_id", user.getId());
        response.put("name", user.getName());
        response.put("username", user.getUsername());
        response.put("mobile", user.getMobile());
        response.put("email", user.getEmail());
        response.put("collegeEmail", user.getCollegeEmail());
        response.put("collegeEmailVerified", user.isCollegeEmailVerified());
        response.put("verified", user.isCollegeEmailVerified());
        response.put("college", user.getCollege());
        response.put("collegeCity", user.getCollegeCity());
        response.put("year", user.getYear());
        response.put("department", user.getDepartment());
        response.put("area", user.getArea());
        response.put("lat", user.getLat());
        response.put("lng", user.getLng());
        response.put("avatar", user.getAvatar());
        response.put("role", user.getRole());
        response.put("status", user.getStatus());
        response.put("createdAt", user.getCreatedAt());
        response.put("listingCount", listingCount);
        response.put("totalViews", totalViews);
        response.put("dealsCount", dealsCount);
        response.put("recentListings", recentListings);

        return ResponseEntity.ok(response);
    }

    @PutMapping(value = "/me")
    public ResponseEntity<?> updateMe(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam Map<String, String> body,
            @RequestParam(value = "avatar", required = false) MultipartFile avatarFile,
            HttpServletRequest request) {

        Optional<User> userOpt = userRepository.findById(userPrincipal.getId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();

        String oldCollege = user.getCollege();
        
        // Allowed fields mapping
        if (body.containsKey("name") && isFieldValued(body.get("name"))) user.setName(body.get("name"));
        if (body.containsKey("username") && isFieldValued(body.get("username"))) user.setUsername(body.get("username").toLowerCase());
        if (body.containsKey("college") && isFieldValued(body.get("college"))) user.setCollege(body.get("college"));
        if (body.containsKey("city") && isFieldValued(body.get("city"))) user.setCollegeCity(body.get("city"));
        if (body.containsKey("year") && isFieldValued(body.get("year"))) user.setYear(body.get("year"));
        if (body.containsKey("department") && isFieldValued(body.get("department"))) user.setDepartment(body.get("department"));
        if (body.containsKey("area") && isFieldValued(body.get("area"))) user.setArea(body.get("area"));
        if (body.containsKey("lat") && isFieldValued(body.get("lat"))) user.setLat(Double.valueOf(body.get("lat")));
        if (body.containsKey("lng") && isFieldValued(body.get("lng"))) user.setLng(Double.valueOf(body.get("lng")));

        // Check if college has changed -> reset badge
        if (user.getCollege() != null && !user.getCollege().equals(oldCollege)) {
            user.setCollegeEmailVerified(false);
            user.setCollegeEmail(null);
        }

        // Upload avatar
        if (avatarFile != null && !avatarFile.isEmpty()) {
            try {
                String avatarUrl = cloudinaryService.uploadAvatarToCloudinary(avatarFile.getBytes());
                user.setAvatar(avatarUrl);
            } catch (Exception e) {
                System.err.println("[Avatar Upload Error during profile update] " + e.getMessage());
            }
        }

        userRepository.save(user);

        User clean = ImageHelper.normalizeUser(user, request);
        return ResponseEntity.ok(Map.of(
                "message", "Profile updated successfully!",
                "user", clean
        ));
    }

    private boolean isFieldValued(String value) {
        return value != null && !value.trim().isEmpty() && !"undefined".equals(value) && !"null".equals(value);
    }

    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> body) {

        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (currentPassword == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Current and new password are required"));
        }
        if (newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("message", "New password must be at least 6 characters"));
        }

        Optional<User> userOpt = userRepository.findById(userPrincipal.getId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Current password is incorrect"));
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password updated successfully!"));
    }

    @PostMapping("/send-verification-otp")
    public ResponseEntity<?> sendVerificationOtp(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> body) {

        String email = body.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "College email is required"));
        }

        List<String> validDomains = Arrays.asList(".edu", ".ac.in", ".edu.in", ".ac.uk", ".edu.au");
        boolean isValid = validDomains.stream().anyMatch(d -> email.toLowerCase().endsWith(d));
        if (!isValid) {
            return ResponseEntity.badRequest().body(Map.of("message", "Only official college emails are accepted (.ac.in, .edu, .edu.in)"));
        }

        if (!emailService.isMailerConfigured()) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(Map.of("message", "Email service not configured. Please contact support."));
        }

        Optional<User> userOpt = userRepository.findById(userPrincipal.getId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        String otp = String.valueOf((int) (100000 + Math.random() * 900000));
        String expiry = Instant.now().plusSeconds(600).toString(); // 10 minutes

        // Custom properties stored transiently on User document for verification
        // Using MongoDB flexible key/value mapping or custom fields
        // Since we didn't add fields to class, let's use dynamic fields if possible, 
        // but since we are in Java we need fields on User class!
        // Wait, did we add OTP fields on User class?
        // Let's check: we didn't add collegeEmailOTP or collegeEmailOTPExpiry fields to User.java!
        // Ah! If we need to store them on User, we should add them, OR we can store them in a Map on UserController (in-memory) just like we did for signup OTPs!
        // Yes, storing them in-memory in a ConcurrentHashMap on UserController is even better and cleaner because we don't contaminate the DB schema with transient verification fields!
        // Wait, let's see: what if the user restarts? In-memory will clear, but it is just transient OTP (10 mins).
        // Let's implement an in-memory verification store inside UserController.
        // It is extremely simple and fast!
        
        return handleOtpInMemory(user, email, otp, expiry);
    }

    private final Map<String, ProfileOtpEntry> profileOtpStore = new ConcurrentHashMap<>();

    private static class ProfileOtpEntry {
        final String email;
        final String otp;
        final long expiry;

        ProfileOtpEntry(String email, String otp, long expiry) {
            this.email = email;
            this.otp = otp;
            this.expiry = expiry;
        }
    }

    private ResponseEntity<?> handleOtpInMemory(User user, String email, String otp, String expiry) {
        long expiryMs = Instant.parse(expiry).toEpochMilli();
        profileOtpStore.put(user.getId(), new ProfileOtpEntry(email, otp, expiryMs));

        // Send response instantly, send email in background
        emailService.sendVerificationOTP(email, otp, user.getName());

        return ResponseEntity.ok(Map.of("message", "Verification code sent to " + email));
    }

    @PostMapping("/verify-college-otp")
    public ResponseEntity<?> verifyCollegeOtp(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {

        String otp = body.get("otp");
        if (otp == null || otp.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "OTP is required"));
        }

        Optional<User> userOpt = userRepository.findById(userPrincipal.getId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();
        ProfileOtpEntry entry = profileOtpStore.get(user.getId());

        if (entry == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "No verification code found. Please request a new one."));
        }

        if (System.currentTimeMillis() > entry.expiry) {
            profileOtpStore.remove(user.getId());
            return ResponseEntity.badRequest().body(Map.of("message", "Verification code has expired. Please request a new one."));
        }

        if (!otp.trim().equals(entry.otp)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Incorrect code. Please check and try again."));
        }

        // OTP verified
        user.setCollegeEmail(entry.email);
        user.setCollegeEmailVerified(true);
        userRepository.save(user);

        profileOtpStore.remove(user.getId());

        User clean = ImageHelper.normalizeUser(user, request);
        return ResponseEntity.ok(Map.of(
                "message", "\uD83C\uDF93 Verified Student badge earned!",
                "user", clean
        ));
    }

    @GetMapping("/me/listings")
    public ResponseEntity<?> getMyListings(@AuthenticationPrincipal UserPrincipal userPrincipal, HttpServletRequest request) {
        List<Product> products = productRepository.findBySellerIdAndStatusNot(userPrincipal.getId(), "deleted");
        List<Product> normalized = products.stream()
                .map(p -> ImageHelper.normalizeProduct(p, request))
                .collect(Collectors.toList());
        return ResponseEntity.ok(normalized);
    }

    @GetMapping("/{id}/listings")
    public ResponseEntity<?> getUserListings(@PathVariable("id") String sellerId, HttpServletRequest request) {
        List<Product> products = productRepository.findBySellerId(sellerId);
        List<Product> activeProducts = products.stream()
                .filter(p -> "active".equalsIgnoreCase(p.getStatus()))
                .map(p -> ImageHelper.normalizeProduct(p, request))
                .collect(Collectors.toList());
        return ResponseEntity.ok(activeProducts);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfile(
            @PathVariable("id") String userId,
            HttpServletRequest request) {

        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        User user = ImageHelper.normalizeUser(userOpt.get(), request);

        // Fetch dynamic listings info
        List<Product> allUserProducts = productRepository.findBySellerIdAndStatusNot(user.getId(), "deleted");
        List<Product> activeProducts = allUserProducts.stream()
                .filter(p -> "active".equalsIgnoreCase(p.getStatus()))
                .collect(Collectors.toList());
        List<Product> soldProducts = allUserProducts.stream()
                .filter(p -> "sold".equalsIgnoreCase(p.getStatus()))
                .collect(Collectors.toList());

        long listingCount = activeProducts.size();
        long dealsCount = soldProducts.size();
        long totalViews = allUserProducts.stream().mapToLong(p -> p.getViews() != null ? p.getViews() : 0).sum();

        List<Product> recentListings = activeProducts.stream()
                .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                .map(p -> ImageHelper.normalizeProduct(p, request))
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("_id", user.getId());
        response.put("name", user.getName());
        response.put("username", user.getUsername());
        response.put("college", user.getCollege());
        response.put("collegeCity", user.getCollegeCity());
        response.put("collegeEmailVerified", user.isCollegeEmailVerified());
        response.put("verified", user.isCollegeEmailVerified());
        response.put("year", user.getYear());
        response.put("department", user.getDepartment());
        response.put("area", user.getArea());
        response.put("avatar", user.getAvatar());
        response.put("createdAt", user.getCreatedAt());
        response.put("listingCount", listingCount);
        response.put("totalViews", totalViews);
        response.put("dealsCount", dealsCount);
        response.put("recentListings", recentListings);

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/me")
    public ResponseEntity<?> deleteOrDeactivateMe(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestParam(value = "action", required = false) String action) {

        Optional<User> userOpt = userRepository.findById(userPrincipal.getId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "User not found"));
        }

        User user = userOpt.get();

        if ("delete".equalsIgnoreCase(action)) {
            user.setStatus("deleted");
            user.setName("Deleted User");
            user.setMobile("0000000000");
            user.setEmail(null);
            user.setCollegeEmail(null);
            user.setAvatar(null);
            userRepository.save(user);

            // Soft-delete their listings
            List<Product> products = productRepository.findBySellerId(user.getId());
            for (Product p : products) {
                p.setStatus("deleted");
                productRepository.save(p);
            }
        } else {
            // Deactivate account
            user.setStatus("deactivated");
            userRepository.save(user);

            // Hide active listings
            List<Product> products = productRepository.findBySellerId(user.getId());
            for (Product p : products) {
                if ("active".equalsIgnoreCase(p.getStatus())) {
                    p.setStatus("inactive");
                    productRepository.save(p);
                }
            }
        }

        return ResponseEntity.ok(Map.of("message", String.format("Account successfully %s.", "delete".equalsIgnoreCase(action) ? "deleted" : "deactivated")));
    }
}
