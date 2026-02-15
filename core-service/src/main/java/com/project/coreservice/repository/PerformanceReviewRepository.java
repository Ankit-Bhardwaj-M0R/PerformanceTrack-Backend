// ORIGINAL (Monolith):
// package com.project.performanceTrack.repository;
// import com.project.performanceTrack.entity.PerformanceReview;
// import com.project.performanceTrack.enums.PerformanceReviewStatus;
// List<PerformanceReview> findByUser_UserId(Integer userId); // OLD - used @ManyToOne User
// Optional<PerformanceReview> findByCycle_CycleIdAndUser_UserId(Integer userId, Integer cycleId); // OLD

// MODIFIED FOR CORE SERVICE:
package com.project.coreservice.repository;

import com.project.coreservice.entity.PerformanceReview;
import com.project.coreservice.enums.PerformanceReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PerformanceReviewRepository extends JpaRepository<PerformanceReview, Integer> {

    // Find reviews by user - CHANGED: user_UserId → userId
    // Because entity changed from @ManyToOne User user to Integer userId
    List<PerformanceReview> findByUserId(Integer userId);

    // Find reviews by cycle - NO CHANGE (ReviewCycle is in same database)
    List<PerformanceReview> findByCycle_CycleId(Integer cycleId);

    // Find reviews by status - NO CHANGE
    List<PerformanceReview> findByStatus(PerformanceReviewStatus status);

    // Find reviews by cycle and user - CHANGED: user_UserId → userId
    Optional<PerformanceReview> findByCycle_CycleIdAndUserId(Integer cycleId, Integer userId);
}
