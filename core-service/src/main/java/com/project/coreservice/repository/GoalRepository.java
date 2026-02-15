// ORIGINAL (Monolith):
// package com.project.performanceTrack.repository;
// import com.project.performanceTrack.entity.Goal;
// import com.project.performanceTrack.enums.GoalStatus;
// List<Goal> findByAssignedToUser_UserId(Integer userId); // OLD - used @ManyToOne User assignedToUser
// List<Goal> findByAssignedManager_UserId(Integer managerId); // OLD - used @ManyToOne User assignedManager
// List<Goal> findByAssignedToUser_UserIdAndStatus(Integer userId, GoalStatus status); // OLD
// List<Goal> findByAssignedManager_UserIdAndStatus(Integer managerId, GoalStatus status); // OLD
// Page<Goal> findByAssignedToUser_UserId(Integer userId, Pageable pageable); // OLD
// Page<Goal> findByAssignedManager_UserId(Integer managerId, Pageable pageable); // OLD

// MODIFIED FOR CORE SERVICE:
package com.project.coreservice.repository;

import com.project.coreservice.entity.Goal;
import com.project.coreservice.enums.GoalStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

// Goal repository for database operations
@Repository
public interface GoalRepository extends JpaRepository<Goal, Integer> {

    // Find goals by assigned user - CHANGED: assignedToUser_UserId → assignedToUserId
    // Because entity changed from @ManyToOne User assignedToUser to Integer assignedToUserId
    List<Goal> findByAssignedToUserId(Integer userId);

    // Find goals by manager - CHANGED: assignedManager_UserId → assignedManagerId
    // Because entity changed from @ManyToOne User assignedManager to Integer assignedManagerId
    List<Goal> findByAssignedManagerId(Integer managerId);

    // Find goals by status - NO CHANGE
    List<Goal> findByStatus(GoalStatus status);

    // Find goals by user and status - CHANGED: assignedToUser_UserId → assignedToUserId
    List<Goal> findByAssignedToUserIdAndStatus(Integer userId, GoalStatus status);

    // Find goals by manager and status - CHANGED: assignedManager_UserId → assignedManagerId
    List<Goal> findByAssignedManagerIdAndStatus(Integer managerId, GoalStatus status);

    // Paginated versions (used by controllers) - CHANGED: User relationship names
    Page<Goal> findByAssignedToUserId(Integer userId, Pageable pageable);
    Page<Goal> findByAssignedManagerId(Integer managerId, Pageable pageable);

    // Needed by scheduler to find stale pending goals - NO CHANGE
    List<Goal> findByStatusAndCreatedDateBefore(GoalStatus status, LocalDateTime before);

    // Needed by scheduler to find stale pending completions - NO CHANGE
    List<Goal> findByStatusAndCompletionSubmittedDateBefore(GoalStatus status, LocalDateTime before);
}
