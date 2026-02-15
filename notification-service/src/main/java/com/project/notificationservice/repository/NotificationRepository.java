package com.project.notificationservice.repository;

import com.project.notificationservice.entity.Notification;
import com.project.notificationservice.enums.NotificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUserIdOrderByCreatedDateDesc(Integer userId);
    List<Notification> findByUserIdAndStatusOrderByCreatedDateDesc(Integer userId,
                                                                   NotificationStatus status);

    // Paginated versions
    Page<Notification> findByUserId(Integer userId, Pageable pageable);
    Page<Notification> findByUserIdAndStatus(Integer userId,
                                             NotificationStatus status, Pageable pageable);
}
