package com.innovx.nodues.service;

import com.innovx.nodues.domain.entity.ClearanceRequest;
import com.innovx.nodues.domain.entity.Notification;
import com.innovx.nodues.domain.entity.User;
import com.innovx.nodues.domain.enums.NotificationType;
import com.innovx.nodues.dto.NotificationDto;
import com.innovx.nodues.exception.ResourceNotFoundException;
import com.innovx.nodues.repository.NotificationRepository;
import com.innovx.nodues.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createNotification(String userId, ClearanceRequest request, String title, String message, NotificationType type) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            log.warn("Cannot create notification for non-existing user id: {}", userId);
            return;
        }

        Notification notification = Notification.builder()
                .user(user)
                .clearanceRequest(request)
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);

        // Optional external notification dispatch (Email/SMS abstraction layer)
        dispatchExternalNotification(user.getEmail(), title, message, type);
    }

    private void dispatchExternalNotification(String email, String title, String message, NotificationType type) {
        // Architecture abstraction: If email fails, clearance workflow does NOT fail.
        try {
            log.info("[External Notification Adapter] Mock email dispatched to {}: [{}] {}", email, title, message);
        } catch (Exception ex) {
            log.error("Failed to dispatch external email notification to {}. Workflow proceeds uninterrupted.", email, ex);
        }
    }

    @Transactional(readOnly = true)
    public Page<NotificationDto> getUserNotifications(String userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToDto);
    }

    @Transactional(readOnly = true)
    public List<NotificationDto> getRecentUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .limit(20)
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(String notificationId, String userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + notificationId));

        if (!notification.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Notification does not belong to current user");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String userId) {
        List<Notification> notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
    }

    private NotificationDto mapToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .requestId(n.getClearanceRequest() != null ? n.getClearanceRequest().getId() : null)
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .read(n.isRead())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
