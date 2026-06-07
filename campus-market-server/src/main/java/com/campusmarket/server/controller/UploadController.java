package com.campusmarket.server.controller;

import com.campusmarket.server.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Please provide an image to upload."));
        }

        try {
            if (cloudName.isEmpty() || apiKey.isEmpty() || apiSecret.isEmpty()) {
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                        .body(Map.of("message", "Image upload service is not configured. Please contact support."));
            }

            String url = cloudinaryService.uploadToCloudinary(file.getBytes(), "campus-market/products");
            return ResponseEntity.ok(Map.of(
                    "message", "Image uploaded successfully!",
                    "url", url
            ));
        } catch (Exception err) {
            System.err.println("[Image Upload Error] Failed to upload image: " + err.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to upload image: " + err.getMessage()));
        }
    }
}
