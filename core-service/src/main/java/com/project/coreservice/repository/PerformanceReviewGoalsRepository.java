// ORIGINAL (Monolith):
// package com.project.performanceTrack.repository;
// import com.project.performanceTrack.entity.PerformanceReviewGoals;

// MODIFIED FOR CORE SERVICE:
package com.project.coreservice.repository;

import com.project.coreservice.entity.PerformanceReviewGoals;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PerformanceReviewGoalsRepository extends JpaRepository<PerformanceReviewGoals, Integer> {

    // Find links by review ID - NO CHANGE (PerformanceReview is in same database)
    List<PerformanceReviewGoals> findByReview_ReviewId(Integer reviewId);

    // Find links by goal ID - NO CHANGE (Goal is in same database)
    List<PerformanceReviewGoals> findByGoal_GoalId(Integer goalId);
}
