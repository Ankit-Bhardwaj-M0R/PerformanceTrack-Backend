// ORIGINAL (Monolith):
// package com.project.performanceTrack.repository;
// import com.project.performanceTrack.entity.Report;
// List<Report> findByGeneratedBy_UserIdOrderByGeneratedDateDesc(Integer userId); // OLD - used @ManyToOne User generatedBy

// MODIFIED FOR CORE SERVICE:
package com.project.coreservice.repository;

import com.project.coreservice.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// Report repository
@Repository
public interface ReportRepository extends JpaRepository<Report, Integer> {

    // Find reports by scope - NO CHANGE
    List<Report> findByScope(String scope);

    // Find reports by generated user - CHANGED: generatedBy_UserId → generatedByUserId
    // Because entity changed from @ManyToOne User generatedBy to Integer generatedByUserId
    List<Report> findByGeneratedByUserIdOrderByGeneratedDateDesc(Integer userId);
}
