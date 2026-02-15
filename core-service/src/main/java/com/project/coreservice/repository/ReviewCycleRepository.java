// ORIGINAL (Monolith):
// package com.project.performanceTrack.repository;
// import com.project.performanceTrack.entity.ReviewCycle;
// import com.project.performanceTrack.enums.ReviewCycleStatus;

// MODIFIED FOR CORE SERVICE:
package com.project.coreservice.repository;

import com.project.coreservice.entity.ReviewCycle;
import com.project.coreservice.enums.ReviewCycleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewCycleRepository extends JpaRepository<ReviewCycle, Integer> {

    // Finding review cycles by status - NO CHANGE (no User relationships)
    List<ReviewCycle> findByStatus(ReviewCycleStatus status);

    // Finding first active review cycle - NO CHANGE (no User relationships)
    Optional<ReviewCycle> findFirstByStatusOrderByStartDateDesc(ReviewCycleStatus status);
}
