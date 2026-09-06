package com.innovx.nodues.controller;

import com.innovx.nodues.dto.NotificationDto;
import com.innovx.nodues.security.UserPrincipal;
import com.innovx.nodues.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "In-app user notifications and alerts")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Get user notifications", description = "Returns paginated list of user notifications")
    public ResponseEntity<Page<NotificationDto>> getNotifications(
            @AuthenticationPrincipal UserPrincipal principal,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(notificationService.getUserNotifications(principal.getId(), pageable));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent notifications", description = "Returns recent 20 notifications for notification bell dropdown")
    public ResponseEntity<List<NotificationDto>> getRecentNotifications(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(notificationService.getRecentUserNotifications(principal.getId()));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Get unread count", description = "Returns count of unread notifications for badge indicator")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(Map.of("unreadCount", notificationService.getUnreadCount(principal.getId())));
    }

    @PatchMapping("/{id}/read")
    @Operation(summary = "Mark notification as read", description = "Marks an individual notification as read")
    public ResponseEntity<Map<String, String>> markAsRead(
            @PathVariable String id,
            @AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAsRead(id, principal.getId());
        return ResponseEntity.ok(Map.of("message", "Marked as read"));
    }

    @PostMapping("/read-all")
    @Operation(summary = "Mark all notifications as read", description = "Marks all unread notifications of the caller as read")
    public ResponseEntity<Map<String, String>> markAllAsRead(
            @AuthenticationPrincipal UserPrincipal principal) {
        notificationService.markAllAsRead(principal.getId());
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
