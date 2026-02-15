// ORIGINAL (Monolith):
// package com.project.performanceTrack.repository;
// import com.project.performanceTrack.entity.GoalCompletionApproval;
// List<GoalCompletionApproval> findByApprovedBy_UserId(Integer userId); // OLD - used @ManyToOne User

// MODIFIED FOR CORE SERVICE:
package com.project.coreservice.repository;

import com.project.coreservice.entity.GoalCompletionApproval;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// Goal completion approval repository
@Repository
public interface GoalCompletionApprovalRepository extends JpaRepository<GoalCompletionApproval, Integer> {

    // Find approvals by goal ID - NO CHANGE (Goal is in same database)
    List<GoalCompletionApproval> findByGoal_GoalId(Integer goalId);

    // Find approvals by approver - CHANGED: approvedBy_UserId → approvedByUserId
    // Because entity changed from @ManyToOne User approvedBy to Integer approvedByUserId
    List<GoalCompletionApproval> findByApprovedByUserId(Integer userId);
}
