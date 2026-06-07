package com.campusmarket.server.service.impl;

import com.campusmarket.server.service.CloudinaryService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    private Cloudinary cloudinary;

    @PostConstruct
    public void init() {
        if (cloudName != null && !cloudName.isEmpty() && apiKey != null && !apiKey.isEmpty() && apiSecret != null && !apiSecret.isEmpty()) {
            cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret
            ));
        }
    }

    @Override
    public String uploadToCloudinary(byte[] bytes, String folder) throws IOException {
        if (cloudinary == null) {
            throw new IllegalStateException("Cloudinary is not configured");
        }
        Map uploadResult = cloudinary.uploader().upload(bytes, ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "image",
                "transformation", "w_1200,h_1200,c_limit,q_auto:good,f_auto"
        ));
        return (String) uploadResult.get("secure_url");
    }

    @Override
    public String uploadAvatarToCloudinary(byte[] bytes) throws IOException {
        if (cloudinary == null) {
            throw new IllegalStateException("Cloudinary is not configured");
        }
        Map uploadResult = cloudinary.uploader().upload(bytes, ObjectUtils.asMap(
                "folder", "campus-market/avatars",
                "resource_type", "image",
                "transformation", "w_400,h_400,c_fill,g_face,q_auto:good,f_auto"
        ));
        return (String) uploadResult.get("secure_url");
    }
}
