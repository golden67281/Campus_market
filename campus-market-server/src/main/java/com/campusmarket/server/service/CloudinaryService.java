package com.campusmarket.server.service;

import java.io.IOException;

public interface CloudinaryService {
    String uploadToCloudinary(byte[] bytes, String folder) throws IOException;
    String uploadAvatarToCloudinary(byte[] bytes) throws IOException;
}
