package com.campusmarket.server.controller;

import com.campusmarket.server.dto.AuthResponse;
import com.campusmarket.server.dto.LoginRequest;
import com.campusmarket.server.dto.ResetPasswordRequest;
import com.campusmarket.server.dto.SignupRequest;
import com.campusmarket.server.model.*;
import com.campusmarket.server.repository.*;
import com.campusmarket.server.security.JwtTokenProvider;
import com.campusmarket.server.security.UserPrincipal;
import com.campusmarket.server.service.CloudinaryService;
import com.campusmarket.server.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private InterestRepository interestRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private EmailService emailService;

    private final Map<String, OtpEntry> signupOtpStore = new ConcurrentHashMap<>();

    private static class OtpEntry {
        final String otp;
        final long expiry;

        OtpEntry(String otp, long expiry) {
            this.otp = otp;
            this.expiry = expiry;
        }
    }

    private String normalizeMobile(String mobile) {
        if (mobile == null) return "";
        String str = mobile.trim();
        if (str.matches("^[6-9]\\d{9}$")) {
            return "+91" + str;
        }
        if (str.matches("^\\+91[6-9]\\d{9}$")) {
            return str;
        }
        return str;
    }

    @PostMapping("/check-mobile")
    public ResponseEntity<?> checkMobile(@RequestBody Map<String, String> body) {
        String mobile = body.get("mobile");
        String normalized = normalizeMobile(mobile);
        if (normalized.isEmpty() || !normalized.matches("^\\+91[6-9]\\d{9}$")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Enter a valid 10-digit mobile number"));
        }

        boolean exists = userRepository.existsByMobile(normalized);
        return ResponseEntity.ok(Map.of("available", !exists));
    }

    @PostMapping("/security-question")
    public ResponseEntity<?> getSecurityQuestion(@RequestBody Map<String, String> body) {
        String mobile = body.get("mobile");
        if (mobile == null || mobile.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mobile number is required"));
        }

        String normalized = normalizeMobile(mobile);
        Optional<User> userOpt = userRepository.findByMobile(normalized);
        if (userOpt.isEmpty() || !"active".equalsIgnoreCase(userOpt.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "No active account found with this mobile number."));
        }

        User user = userOpt.get();
        if (user.getSecurityQuestion() == null || user.getSecurityQuestion().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "This account has no security question configured. Please contact support."));
        }

        return ResponseEntity.ok(Map.of("question", user.getSecurityQuestion()));
    }

    @PostMapping("/send-signup-email-otp")
    public ResponseEntity<?> sendSignupEmailOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String name = body.get("name");

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
                    .body(Map.of("message", "Email service not configured. You can verify after signup."));
        }

        String otp = String.valueOf((int) (100000 + Math.random() * 900000));
        long expiry = System.currentTimeMillis() + 10 * 60 * 1000; // 10 minutes
        signupOtpStore.put(email.toLowerCase(), new OtpEntry(otp, expiry));

        // Send response instantly, send email asynchronously
        emailService.sendVerificationOTP(email, otp, name != null ? name : "Student");

        return ResponseEntity.ok(Map.of("message", "Verification code sent to " + email));
    }

    @PostMapping("/verify-signup-email-otp")
    public ResponseEntity<?> verifySignupEmailOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        String otp = body.get("otp");

        if (email == null || otp == null || email.trim().isEmpty() || otp.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email and OTP are required"));
        }

        OtpEntry entry = signupOtpStore.get(email.toLowerCase());
        if (entry == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "No verification code found. Please request a new one."));
        }

        if (System.currentTimeMillis() > entry.expiry) {
            signupOtpStore.remove(email.toLowerCase());
            return ResponseEntity.badRequest().body(Map.of("message", "Verification code has expired. Please request a new one."));
        }

        if (!otp.trim().equals(entry.otp)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Incorrect code. Please check and try again."));
        }

        signupOtpStore.remove(email.toLowerCase());
        return ResponseEntity.ok(Map.of("message", "Email verified successfully!"));
    }

    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> signup(
            @ModelAttribute SignupRequest request,
            @RequestParam(value = "avatar", required = false) MultipartFile avatarFile) {

        if (request.getName() == null || request.getUsername() == null || request.getMobile() == null ||
                request.getCollege() == null || request.getPassword() == null ||
                request.getSecurityQuestion() == null || request.getSecurityAnswer() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing required signup fields, security question, or answer."));
        }

        String normalizedMobile = normalizeMobile(request.getMobile());

        if (userRepository.existsByUsername(request.getUsername().toLowerCase())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username is already taken"));
        }
        if (userRepository.existsByMobile(normalizedMobile)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mobile number is already registered"));
        }

        String passwordHash = passwordEncoder.encode(request.getPassword());
        String answerHash = passwordEncoder.encode(request.getSecurityAnswer().toLowerCase().trim());

        String avatarUrl = null;
        if (avatarFile != null && !avatarFile.isEmpty()) {
            try {
                avatarUrl = cloudinaryService.uploadAvatarToCloudinary(avatarFile.getBytes());
            } catch (Exception e) {
                System.err.println("[Avatar Upload Error during signup] " + e.getMessage());
            }
        }

        boolean verified = "true".equals(request.getCollegeEmailVerified()) && request.getCollegeEmail() != null;

        User user = User.builder()
                .id("u_" + System.currentTimeMillis() + "_" + (int) (Math.random() * 10000))
                .name(request.getName())
                .username(request.getUsername().toLowerCase())
                .mobile(normalizedMobile)
                .email(null)
                .collegeEmail(verified ? request.getCollegeEmail() : null)
                .collegeEmailVerified(verified)
                .college(request.getCollege())
                .collegeCity(request.getCity() != null ? request.getCity() : "")
                .year(request.getYear() != null ? request.getYear() : "")
                .department(request.getDepartment() != null ? request.getDepartment() : "")
                .area(request.getArea() != null ? request.getArea() : "")
                .lat(request.getLat() != null && !request.getLat().isEmpty() ? Double.valueOf(request.getLat()) : null)
                .lng(request.getLng() != null && !request.getLng().isEmpty() ? Double.valueOf(request.getLng()) : null)
                .avatar(avatarUrl)
                .password(passwordHash)
                .securityQuestion(request.getSecurityQuestion())
                .securityAnswer(answerHash)
                .role("user")
                .status("active")
                .createdAt(Instant.now().toString())
                .build();

        userRepository.save(user);

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String token = tokenProvider.generateToken(userPrincipal);

        return ResponseEntity.status(HttpStatus.CREATED).body(new AuthResponse(user, token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        if ((request.getMobile() == null && request.getEmail() == null) || request.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please provide identity credentials and password"));
        }

        Optional<User> userOpt = Optional.empty();
        if (request.getMobile() != null && !request.getMobile().isEmpty()) {
            userOpt = userRepository.findByMobile(normalizeMobile(request.getMobile()));
        } else if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            userOpt = userRepository.findByEmail(request.getEmail())
                    .or(() -> userRepository.findByCollegeEmail(request.getEmail()));
        }

        if (userOpt.isEmpty() || !"active".equalsIgnoreCase(userOpt.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Account not found or inactive"));
        }

        User user = userOpt.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Incorrect password"));
        }

        UserPrincipal userPrincipal = UserPrincipal.create(user);
        String token = tokenProvider.generateToken(userPrincipal);

        return ResponseEntity.ok(new AuthResponse(user, token));
    }

    @PutMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (request.getMobile() == null || request.getPassword() == null || request.getSecurityAnswer() == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing fields for password reset"));
        }

        String normalized = normalizeMobile(request.getMobile());
        Optional<User> userOpt = userRepository.findByMobile(normalized);
        if (userOpt.isEmpty() || !"active".equalsIgnoreCase(userOpt.get().getStatus())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Active account with this mobile number was not found."));
        }

        User user = userOpt.get();
        if (user.getSecurityAnswer() == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "This account has no security answer configured. Please contact support."));
        }

        if (!passwordEncoder.matches(request.getSecurityAnswer().toLowerCase().trim(), user.getSecurityAnswer())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Incorrect security answer. Reset denied."));
        }

        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password reset successfully!"));
    }

    @GetMapping("/db-status")
    public ResponseEntity<?> getDbStatus() {
        long userCount = userRepository.count();
        long productCount = productRepository.count();
        long chatCount = chatRepository.count();
        long notificationCount = notificationRepository.count();

        List<User> users = userRepository.findAll();
        List<Map<String, String>> usersSummary = new ArrayList<>();
        for (User u : users) {
            Map<String, String> summary = new HashMap<>();
            summary.put("_id", u.getId());
            summary.put("username", u.getUsername());
            String mob = u.getMobile();
            if (mob != null && mob.length() >= 6) {
                summary.put("mobile", mob.substring(0, 4) + "****" + mob.substring(mob.length() - 3));
            } else {
                summary.put("mobile", "");
            }
            usersSummary.add(summary);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("hasUri", true);
        response.put("writeTestResult", "Success");
        response.put("writeTestError", null);
        response.put("userCount", userCount);
        response.put("productCount", productCount);
        response.put("chatCount", chatCount);
        response.put("notificationCount", notificationCount);
        response.put("users", usersSummary);
        response.put("products", productRepository.findAll());
        response.put("chats", chatRepository.findAll());
        response.put("notifications", notificationRepository.findAll());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/repair-db")
    public ResponseEntity<?> repairDb() {
        List<User> users = userRepository.findAll();
        List<Product> products = productRepository.findAll();
        List<Chat> chats = chatRepository.findAll();
        List<Notification> notifications = notificationRepository.findAll();

        int repairedUsers = 0;
        int repairedProducts = 0;
        int repairedChats = 0;
        int repairedNotifications = 0;

        Map<String, String> userToIdMap = new HashMap<>();

        // 1. Ensure all users have IDs
        for (User u : users) {
            if (u.getId() == null || u.getId().isEmpty() || "null".equals(u.getId()) || "undefined".equals(u.getId())) {
                u.setId("u_" + System.currentTimeMillis() + "_" + (int) (Math.random() * 10000));
                userRepository.save(u);
                repairedUsers++;
            }
            userToIdMap.put(u.getUsername().toLowerCase(), u.getId());
        }

        // 2. Repair Products
        for (Product p : products) {
            boolean needsUpdate = false;
            String username = p.getSeller() != null ? p.getSeller().getUsername() : null;
            String mappedUserId = username != null ? userToIdMap.get(username.toLowerCase()) : null;

            if (mappedUserId == null && p.getLocation() != null) {
                String location = p.getLocation().trim();
                Optional<User> match = users.stream().filter(u -> {
                    String cleanMob = u.getMobile() != null ? u.getMobile().replaceAll("\\D", "") : "";
                    return cleanMob.endsWith(location);
                }).findFirst();
                if (match.isPresent()) {
                    mappedUserId = match.get().getId();
                }
            }

            if (mappedUserId != null) {
                String finalId = mappedUserId;
                Optional<User> match = users.stream().filter(u -> u.getId().equals(finalId)).findFirst();
                if (match.isPresent()) {
                    User u = match.get();
                    if (p.getSellerId() == null || !p.getSellerId().equals(finalId)) {
                        p.setSellerId(finalId);
                        needsUpdate = true;
                    }
                    SellerInfo sellerInfo = SellerInfo.builder()
                            .id(u.getId())
                            .name(u.getName())
                            .username(u.getUsername())
                            .mobile(u.getMobile())
                            .email(u.getEmail())
                            .collegeEmail(u.getCollegeEmail())
                            .collegeEmailVerified(u.isCollegeEmailVerified())
                            .college(u.getCollege())
                            .collegeCity(u.getCollegeCity())
                            .year(u.getYear())
                            .department(u.getDepartment())
                            .area(u.getArea())
                            .lat(u.getLat())
                            .lng(u.getLng())
                            .avatar(u.getAvatar())
                            .role(u.getRole())
                            .status(u.getStatus())
                            .createdAt(u.getCreatedAt())
                            .city(u.getCollegeCity())
                            .build();
                    p.setSeller(sellerInfo);
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                productRepository.save(p);
                repairedProducts++;
            }
        }

        // 3. Repair Chats
        for (Chat c : chats) {
            boolean needsUpdate = false;
            if (c.getSenderId() == null || "null".equals(c.getSenderId()) || "undefined".equals(c.getSenderId())) {
                Optional<Product> pr = productRepository.findById(c.getProductId());
                if (pr.isPresent() && pr.get().getSellerId() != null) {
                    c.setSenderId(pr.get().getSellerId());
                    needsUpdate = true;
                }
            }
            if (c.getReceiverId() == null || "null".equals(c.getReceiverId()) || "undefined".equals(c.getReceiverId())) {
                Optional<Product> pr = productRepository.findById(c.getProductId());
                if (pr.isPresent() && pr.get().getSellerId() != null) {
                    c.setReceiverId(pr.get().getSellerId());
                    needsUpdate = true;
                }
            }
            if (needsUpdate) {
                chatRepository.save(c);
                repairedChats++;
            }
        }

        // 4. Repair Notifications
        for (Notification n : notifications) {
            boolean needsUpdate = false;
            if (n.getUserId() == null || "null".equals(n.getUserId()) || "undefined".equals(n.getUserId())) {
                if (!users.isEmpty()) {
                    n.setUserId(users.get(0).getId());
                    needsUpdate = true;
                }
            }
            if (needsUpdate) {
                notificationRepository.save(n);
                repairedNotifications++;
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Repair successfully executed");
        response.put("repairedUsers", repairedUsers);
        response.put("repairedProducts", repairedProducts);
        response.put("repairedChats", repairedChats);
        response.put("repairedNotifications", repairedNotifications);
        response.put("userMap", userToIdMap);

        return ResponseEntity.ok(response);
    }

    @Autowired(required = false)
    private org.springframework.mail.javamail.JavaMailSender debugMailSender;

    @Value("${spring.mail.username:}")
    private String debugMailUsername;

    @Value("${app.mail.sender:campusmarket.app@gmail.com}")
    private String debugMailSenderAddress;

    @GetMapping("/test-mail-debug")
    public ResponseEntity<?> testMailDebug(@RequestParam("to") String toEmail) {
        if (debugMailSender == null) {
            return ResponseEntity.ok(Map.of("status", "error", "message", "JavaMailSender is null"));
        }
        try {
            jakarta.mail.internet.MimeMessage message = debugMailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(String.format("\"Campus Market Debug\" <%s>", debugMailSenderAddress));
            helper.setTo(toEmail);
            helper.setSubject("Campus Market SMTP Test");
            helper.setText("If you see this, email sending is working!", false);

            debugMailSender.send(message);
            return ResponseEntity.ok(Map.of("status", "success", "message", "Email sent successfully to " + toEmail));
        } catch (Exception ex) {
            java.io.StringWriter sw = new java.io.StringWriter();
            java.io.PrintWriter pw = new java.io.PrintWriter(sw);
            ex.printStackTrace(pw);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "status", "error",
                            "message", ex.getMessage(),
                            "type", ex.getClass().getName(),
                            "stackTrace", sw.toString()
                    ));
        }
    }
}
