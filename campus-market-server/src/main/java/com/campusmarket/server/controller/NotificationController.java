package com.campusmarket.server.controller;

import com.campusmarket.server.model.Notification;
import com.campusmarket.server.repository.NotificationRepository;
import com.campusmarket.server.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<?> getNotifications(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userPrincipal.getId());

        List<Map<String, Object>> formatted = notifications.stream().map(n -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", n.getId());
            map.put("_id", n.getId());
            map.put("userId", n.getUserId());
            map.put("type", n.getType());
            map.put("title", n.getTitle());
            map.put("body", n.getBody());
            map.put("message", n.getTitle()); // Map title to message
            map.put("subMessage", n.getBody()); // Map body to subMessage
            map.put("relatedProductId", n.getRelatedProductId());
            map.put("relatedUserId", n.getRelatedUserId());
            map.put("read", n.isRead());
            map.put("createdAt", n.getCreatedAt());
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(formatted);
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> readAllNotifications(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userPrincipal.getId());
        for (Notification n : notifications) {
            if (!n.isRead()) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        }
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> readSingleNotification(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") String id) {

        Optional<Notification> notifOpt = notificationRepository.findById(id);
        if (notifOpt.isEmpty() || !notifOpt.get().getUserId().equals(userPrincipal.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Notification not found"));
        }

        Notification n = notifOpt.get();
        n.setRead(true);
        notificationRepository.save(n);

        Map<String, Object> map = new HashMap<>();
        map.put("id", n.getId());
        map.put("_id", n.getId());
        map.put("userId", n.getUserId());
        map.put("type", n.getType());
        map.put("title", n.getTitle());
        map.put("body", n.getBody());
        map.put("message", n.getTitle());
        map.put("subMessage", n.getBody());
        map.put("relatedProductId", n.getRelatedProductId());
        map.put("relatedUserId", n.getRelatedUserId());
        map.put("read", n.isRead());
        map.put("createdAt", n.getCreatedAt());

        return ResponseEntity.ok(map);
    }
}
