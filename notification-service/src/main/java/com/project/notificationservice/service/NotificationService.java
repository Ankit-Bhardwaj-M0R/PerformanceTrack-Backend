package com.project.notificationservice.service;


import com.project.notificationservice.entity.Notification;
import com.project.notificationservice.enums.NotificationStatus;

import com.project.notificationservice.enums.NotificationType;
import com.project.notificationservice.exception.ResourceNotFoundException;
import com.project.notificationservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class    NotificationService {

    private final NotificationRepository notifRepo;
    private final SseEmitterService sseEmitterService;

    public void sendNotification(Integer userId, NotificationType type,
                                 String message,
                                 String entityType, Integer entityId,
                                 String priority, boolean actionReq) {
        Notification notif = new Notification();
        notif.setUserId(userId);  // Changed from setUser()
        notif.setType(type);
        notif.setMessage(message);
        notif.setRelatedEntityType(entityType);
        notif.setRelatedEntityId(entityId);
        notif.setStatus(NotificationStatus.UNREAD);
        notif.setPriority(priority != null ? priority : "NORMAL");
        notif.setActionRequired(actionReq);
        Notification saved = notifRepo.save(notif);

        // Push to user in real-time if they're connected
        sseEmitterService.sendToUser(userId.intValue(), saved);
    }


    // Existing - keep (used by markAllAsRead)
    public List<Notification> getNotifications(Integer userId, String status) {
        if (status != null) {
            NotificationStatus notifStatus = NotificationStatus.valueOf(status.toUpperCase());
            return notifRepo.findByUserIdAndStatusOrderByCreatedDateDesc(userId, notifStatus);
        }
        return notifRepo.findByUserIdOrderByCreatedDateDesc(userId);
    }

    // New - paginated
    public Page<Notification> getNotifications(Integer userId, String status, Pageable pageable) {
        if (status != null) {
            NotificationStatus notifStatus = NotificationStatus.valueOf(status.toUpperCase());
            return notifRepo.findByUserIdAndStatus(userId, notifStatus, pageable);
        }
        return notifRepo.findByUserId(userId, pageable);
    }

    public Notification markAsRead(Integer notifId) {
        Notification notif = notifRepo.findById(notifId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        notif.setStatus(NotificationStatus.READ);
        notif.setReadDate(LocalDateTime.now());
        return notifRepo.save(notif);
    }

    @Transactional
    public void markAllAsRead(Integer userId) {
        List<Notification> unreadNotifs = notifRepo
                .findByUserIdAndStatusOrderByCreatedDateDesc(userId, NotificationStatus.UNREAD);

        unreadNotifs.forEach(n -> {
            n.setStatus(NotificationStatus.READ);
            n.setReadDate(LocalDateTime.now());
        });

        notifRepo.saveAll(unreadNotifs);
    }
}