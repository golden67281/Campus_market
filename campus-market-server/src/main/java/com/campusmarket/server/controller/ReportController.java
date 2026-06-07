package com.campusmarket.server.controller;

import com.campusmarket.server.model.Report;
import com.campusmarket.server.repository.ReportRepository;
import com.campusmarket.server.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportRepository reportRepository;

    @PostMapping("/listing/{id}")
    public ResponseEntity<?> reportListing(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") String listingId,
            @RequestBody Map<String, String> body) {

        String reason = body.get("reason");
        String detail = body.get("detail");

        if (reason == null || reason.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Reason is required to file a report"));
        }

        Report report = Report.builder()
                .id("r_" + System.currentTimeMillis() + "_" + (int) (Math.random() * 10000))
                .reporterId(userPrincipal.getId())
                .targetType("product")
                .targetId(listingId)
                .reason(reason)
                .detail(detail != null ? detail : "")
                .status("pending")
                .createdAt(Instant.now().toString())
                .build();

        reportRepository.save(report);
        System.out.println("[REPORT AUDIT] Listing " + listingId + " reported by user " + userPrincipal.getId() + " for \"" + reason + "\"");

        return ResponseEntity.ok(Map.of("message", "Report submitted successfully. Thank you."));
    }

    @PostMapping("/user/{id}")
    public ResponseEntity<?> reportUser(
            @AuthenticationPrincipal UserPrincipal userPrincipal,
            @PathVariable("id") String userId,
            @RequestBody Map<String, String> body) {

        String reason = body.get("reason");
        String detail = body.get("detail");

        if (reason == null || reason.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Reason is required to file a report"));
        }

        Report report = Report.builder()
                .id("r_" + System.currentTimeMillis() + "_" + (int) (Math.random() * 10000))
                .reporterId(userPrincipal.getId())
                .targetType("user")
                .targetId(userId)
                .reason(reason)
                .detail(detail != null ? detail : "")
                .status("pending")
                .createdAt(Instant.now().toString())
                .build();

        reportRepository.save(report);
        System.out.println("[REPORT AUDIT] User " + userId + " reported by reporter " + userPrincipal.getId() + " for \"" + reason + "\"");

        return ResponseEntity.ok(Map.of("message", "Report submitted successfully. Thank you."));
    }
}
