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
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @GetMapping
    public ResponseEntity<?> getConversations(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            HttpServletRequest request) {

        String currentUserId = userPrincipal.getId();
        List<Chat> allMessages = chatRepository.findBySenderIdOrReceiverId(currentUserId, currentUserId);

        Map<String, List<Chat>> groups = new HashMap<>();
        for (Chat msg : allMessages) {
            String partnerId = msg.getSenderId().equals(currentUserId) ? msg.getReceiverId() : msg.getSenderId();
            String key = msg.getProductId() + "_" + partnerId;
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(msg);
        }

        List<Map<String, Object>> conversations = new ArrayList<>();

        for (Map.Entry<String, List<Chat>> entry : groups.entrySet()) {
            List<Chat> groupMsgs = entry.getValue();
            // Sort descending to get the last message
            groupMsgs.sort((m1, m2) -> m2.getCreatedAt().compareTo(m1.getCreatedAt()));
            Chat lastMessage = groupMsgs.get(0);

            // Count unread received messages
            long unreadCount = groupMsgs.stream()
                    .filter(m -> m.getReceiverId().equals(currentUserId) && !m.isRead())
                    .count();

            String[] keys = entry.getKey().split("_");
            String productId = keys[0];
            String partnerId = keys[1];

            Optional<User> partnerOpt = userRepository.findById(partnerId);
            if (partnerOpt.isEmpty() || "deleted".equalsIgnoreCase(partnerOpt.get().getStatus())) {
                continue; // Skip if user no longer exists or is deleted
            }
            User partnerUser = partnerOpt.get();

            Optional<Product> prodOpt = productRepository.findById(productId);
            Map<String, Object> productMap = new HashMap<>();
            if (prodOpt.isPresent()) {
                Product p = ImageHelper.normalizeProduct(prodOpt.get(), request);
                productMap.put("_id", p.getId());
                productMap.put("title", p.getTitle());
                productMap.put("price", p.getPrice());
                productMap.put("images", p.getImages());
            } else {
                productMap.put("_id", productId);
                productMap.put("title", "Unavailable Product");
                productMap.put("price", 0.0);
                productMap.put("images", new ArrayList<>());
            }

            Map<String, Object> partnerMap = new HashMap<>();
            partnerMap.put("_id", partnerUser.getId());
            partnerMap.put("name", partnerUser.getName());
            partnerMap.put("username", partnerUser.getUsername());
            partnerMap.put("avatar", ImageHelper.normalizeUser(partnerUser, request).getAvatar());

            Map<String, Object> lastMsgMap = new HashMap<>();
            lastMsgMap.put("_id", lastMessage.getId());
            lastMsgMap.put("text", lastMessage.getText());
            lastMsgMap.put("senderId", lastMessage.getSenderId());
            lastMsgMap.put("receiverId", lastMessage.getReceiverId());
            lastMsgMap.put("createdAt", lastMessage.getCreatedAt());
            lastMsgMap.put("read", lastMessage.isRead());

            Map<String, Object> convo = new HashMap<>();
            convo.put("productId", productId);
            convo.put("partnerId", partnerId);
            convo.put("product", productMap);
            convo.put("partner", partnerMap);
            convo.put("lastMessage", lastMsgMap);
            convo.put("unreadCount", unreadCount);

            conversations.add(convo);
        }

        // Sort by last message timestamp descending
        conversations.sort((c1, c2) -> {
            Map<String, Object> lm1 = (Map<String, Object>) c1.get("lastMessage");
            Map<String, Object> lm2 = (Map<String, Object>) c2.get("lastMessage");
            return ((String) lm2.get("createdAt")).compareTo((String) lm1.get("createdAt"));
        });

        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/{productId}/{partnerId}")
    public ResponseEntity<?> getMessageHistory(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("productId") String productId,
            @PathVariable("partnerId") String partnerId,
            HttpServletRequest request) {

        String currentUserId = userPrincipal.getId();

        Optional<User> partnerOpt = userRepository.findById(partnerId);
        if (partnerOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Conversation partner not found"));
        }
        User partnerUser = partnerOpt.get();

        List<Chat> convoMessages = chatRepository.findChatRoomMessages(productId, currentUserId, partnerId);

        // Mark unread received messages as read
        boolean updated = false;
        for (Chat m : convoMessages) {
            if (m.getReceiverId().equals(currentUserId) && !m.isRead()) {
                m.setRead(true);
                chatRepository.save(m);
                updated = true;
            }
        }

        // Sort chronological (ascending)
        convoMessages.sort(Comparator.comparing(Chat::getCreatedAt));

        Optional<Product> prodOpt = productRepository.findById(productId);
        Map<String, Object> productMap = null;
        if (prodOpt.isPresent()) {
            Product p = ImageHelper.normalizeProduct(prodOpt.get(), request);
            productMap = new HashMap<>();
            productMap.put("_id", p.getId());
            productMap.put("title", p.getTitle());
            productMap.put("price", p.getPrice());
            productMap.put("images", p.getImages());
            productMap.put("sellerId", p.getSellerId());
        }

        Map<String, Object> partnerMap = new HashMap<>();
        partnerMap.put("_id", partnerUser.getId());
        partnerMap.put("name", partnerUser.getName());
        partnerMap.put("username", partnerUser.getUsername());
        partnerMap.put("avatar", ImageHelper.normalizeUser(partnerUser, request).getAvatar());

        Map<String, Object> response = new HashMap<>();
        response.put("product", productMap);
        response.put("partner", partnerMap);
        response.put("messages", convoMessages);

        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @RequestBody Map<String, String> body) {

        String productId = body.get("productId");
        String receiverId = body.get("receiverId");
        String text = body.get("text");
        String senderId = userPrincipal.getId();

        if (productId == null || receiverId == null || text == null || text.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing parameters or empty message"));
        }

        Optional<User> receiverOpt = userRepository.findById(receiverId);
        User receiver = null;
        if (receiverOpt.isPresent()) {
            receiver = receiverOpt.get();
        } else {
            // Fallback: match by product sellerId
            Optional<Product> productOpt = productRepository.findById(productId);
            if (productOpt.isPresent() && productOpt.get().getSellerId() != null) {
                receiverOpt = userRepository.findById(productOpt.get().getSellerId());
                if (receiverOpt.isPresent()) {
                    receiver = receiverOpt.get();
                    receiverId = receiver.getId();
                }
            }
        }

        if (receiver == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Message receiver not found"));
        }

        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Product listing not found"));
        }
        Product product = productOpt.get();

        Chat chat = Chat.builder()
                .id("msg_" + System.currentTimeMillis() + "_" + (int) (Math.random() * 10000))
                .productId(productId)
                .senderId(senderId)
                .receiverId(receiverId)
                .text(text.trim())
                .createdAt(Instant.now().toString())
                .read(false)
                .build();

        chatRepository.save(chat);

        // Create notification for receiver
        Optional<User> senderOpt = userRepository.findById(senderId);
        String senderName = "A student";
        if (senderOpt.isPresent()) {
            User sender = senderOpt.get();
            senderName = sender.getName() != null ? sender.getName() : sender.getUsername();
        }

        String summary = text.trim();
        if (summary.length() > 60) {
            summary = summary.substring(0, 60) + "...";
        }

        Notification notification = Notification.builder()
                .id("n_" + System.currentTimeMillis() + "_" + (int) (Math.random() * 10000))
                .userId(receiverId)
                .type("chat_message")
                .title(senderName + " sent you a message")
                .body(summary)
                .relatedProductId(productId)
                .relatedUserId(senderId)
                .read(false)
                .createdAt(Instant.now().toString())
                .build();

        notificationRepository.save(notification);

        return ResponseEntity.status(HttpStatus.CREATED).body(chat);
    }
}
