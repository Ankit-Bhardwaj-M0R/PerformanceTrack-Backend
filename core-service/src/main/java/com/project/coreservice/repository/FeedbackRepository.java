// ORIGINAL (Monolith):
// package com.project.performanceTrack.repository;
// import com.project.performanceTrack.entity.Feedback;

// MODIFIED FOR CORE SERVICE:
package com.project.coreservice.repository;

import com.project.coreservice.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    // Find by goalId - NO CHANGE (Goal is in same database)
    List<Feedback> findByGoal_GoalId(Integer goalId);

    // Find by reviewId - NO CHANGE (PerformanceReview is in same database)
    List<Feedback> findByReview_ReviewId(Integer reviewId);
}
