package com.campusmarket.server.utils;

import com.campusmarket.server.model.Product;
import com.campusmarket.server.model.SellerInfo;
import com.campusmarket.server.model.User;
import jakarta.servlet.http.HttpServletRequest;

import java.util.ArrayList;
import java.util.List;

public class ImageHelper {

    public static String getBaseUrl(HttpServletRequest request) {
        String baseUrlEnv = System.getenv("BASE_URL");
        if (baseUrlEnv != null && !baseUrlEnv.isEmpty()) {
            return baseUrlEnv;
        }
        
        String proto = request.getHeader("X-Forwarded-Proto");
        if (proto == null || proto.isEmpty()) {
            proto = request.getScheme();
        }
        
        String scheme = proto.contains("https") ? "https" : proto;
        String host = request.getHeader("Host");
        return scheme + "://" + host;
    }

    public static Product normalizeProduct(Product product, HttpServletRequest request) {
        if (product == null) return null;

        String baseUrl = getBaseUrl(request);

        if (product.getImages() != null) {
            List<String> normalizedImages = new ArrayList<>();
            for (String img : product.getImages()) {
                if (img == null) {
                    normalizedImages.add(null);
                    continue;
                }
                if (img.startsWith("https://res.cloudinary.com")) {
                    normalizedImages.add(img);
                } else if (img.startsWith("http://") || img.startsWith("https://")) {
                    String updated = img.replace("http://localhost:5000", baseUrl)
                            .replaceAll("^http://", "https://");
                    normalizedImages.add(updated);
                } else {
                    String leadingSlash = img.startsWith("/") ? "" : "/";
                    normalizedImages.add(baseUrl + leadingSlash + img);
                }
            }
            product.setImages(normalizedImages);
        }

        if (product.getSeller() != null) {
            product.setSeller(normalizeSellerInfo(product.getSeller(), request));
        }

        return product;
    }

    public static User normalizeUser(User user, HttpServletRequest request) {
        if (user == null) return null;

        String baseUrl = getBaseUrl(request);

        if (user.getAvatar() != null && !user.getAvatar().isEmpty()) {
            String avatar = user.getAvatar();
            if (avatar.startsWith("https://res.cloudinary.com")) {
                user.setAvatar(avatar);
            } else if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
                String updated = avatar.replace("http://localhost:5000", baseUrl)
                        .replaceAll("^http://", "https://");
                user.setAvatar(updated);
            } else {
                String leadingSlash = avatar.startsWith("/") ? "" : "/";
                user.setAvatar(baseUrl + leadingSlash + avatar);
            }
        }

        return user;
    }

    public static SellerInfo normalizeSellerInfo(SellerInfo seller, HttpServletRequest request) {
        if (seller == null) return null;

        String baseUrl = getBaseUrl(request);

        if (seller.getAvatar() != null && !seller.getAvatar().isEmpty()) {
            String avatar = seller.getAvatar();
            if (avatar.startsWith("https://res.cloudinary.com")) {
                seller.setAvatar(avatar);
            } else if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
                String updated = avatar.replace("http://localhost:5000", baseUrl)
                        .replaceAll("^http://", "https://");
                seller.setAvatar(updated);
            } else {
                String leadingSlash = avatar.startsWith("/") ? "" : "/";
                seller.setAvatar(baseUrl + leadingSlash + avatar);
            }
        }

        return seller;
    }
}
