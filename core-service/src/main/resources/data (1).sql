-- ============================================================================
-- CORE-SERVICE SEED DATA
-- ============================================================================
-- This seed data is extracted from the monolith data.sql
-- and adapted for the core-service microservice
-- Contains: review_cycles, goals, goal_completion_approvals,
--           performance_reviews, performance_review_goals, feedback, reports
-- ============================================================================

-- Clean existing data (if any)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE feedback;
TRUNCATE TABLE goal_completion_approvals;
TRUNCATE TABLE performance_review_goals;
TRUNCATE TABLE performance_reviews;
TRUNCATE TABLE goals;
TRUNCATE TABLE review_cycles;
TRUNCATE TABLE reports;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- REVIEW CYCLES
-- ============================================================================

-- Active Cycle: Q1 2026 (ID: 1)
INSERT INTO review_cycles (cycle_id, title, start_date, end_date, status, requires_completion_approval, evidence_required, created_date, last_modified_date)
VALUES (1, 'Q1 2026 Performance Review', '2026-01-01', '2026-03-31', 'ACTIVE', TRUE, TRUE, '2025-12-15 09:00:00', '2025-12-15 09:00:00');

-- Past Cycle: Q4 2025 (ID: 2) - CLOSED
INSERT INTO review_cycles (cycle_id, title, start_date, end_date, status, requires_completion_approval, evidence_required, created_date, last_modified_date)
VALUES (2, 'Q4 2025 Performance Review', '2025-10-01', '2025-12-31', 'CLOSED', TRUE, TRUE, '2025-09-15 09:00:00', '2025-12-31 23:59:59');

-- ============================================================================
-- GOALS - VARIOUS LIFECYCLE SCENARIOS
-- ============================================================================

-- -------------------------
-- SCENARIO 1: COMPLETED GOAL (Full Happy Path)
-- -------------------------

-- Goal 1: Rahul creates API optimization goal (COMPLETED with all evidence)
INSERT INTO goals (goal_id, assigned_to_user_id, assigned_manager_id, title, description, category, priority,
                   start_date, end_date, status, request_changes,
                   evidence_link, evidence_link_description, evidence_access_instructions, completion_notes,
                   evidence_link_verification_status, evidence_link_verification_notes, evidence_link_verified_by, evidence_link_verified_date,
                   completion_approval_status, completion_submitted_date, completion_approved_by, completion_approved_date,
                   final_completion_date, manager_completion_comments,
                   approved_by, approved_date,
                   progress_notes, created_date, last_modified_date)
VALUES (1, 4, 2, 'Reduce API Response Time by 30%',
        'Optimize database queries and implement Redis caching to improve API performance',
        'TECHNICAL', 'HIGH', '2026-01-05', '2026-02-28', 'COMPLETED', FALSE,
        'https://drive.google.com/folder/rahul-api-optimization-q1-2026',
        'Performance dashboard screenshots, before/after metrics, GitHub PR links, and detailed documentation',
        'Accessible to all @company.com email addresses',
        'Successfully achieved 35% improvement in API response time, exceeding the 30% target. Implemented Redis caching for frequently accessed data and optimized all major database queries. Load testing confirms sustained improvement under high traffic.',
        'VERIFIED',
        'All evidence reviewed and verified. Metrics clearly show 35% improvement. Excellent documentation.',
        2, '2026-02-23 10:30:00',
        'APPROVED', '2026-02-22 14:00:00', 2, '2026-02-25 16:30:00',
        '2026-02-25 16:30:00',
        'Excellent work, Rahul! You not only met but exceeded the 30% target with a 35% improvement.',
        2, '2026-01-06 09:30:00',
        '2026-01-15 14:30:00: Started database query optimization\n2026-01-22 11:00:00: Completed Redis caching implementation - seeing 15% improvement\n2026-02-10 16:45:00: Optimized N+1 queries - now at 28% improvement\n2026-02-20 10:15:00: Final optimizations complete - achieved 35% improvement!',
        '2026-01-05 10:00:00', '2026-02-25 16:30:00');

-- -------------------------
-- SCENARIO 2: IN_PROGRESS GOAL
-- -------------------------

INSERT INTO goals (goal_id, assigned_to_user_id, assigned_manager_id, title, description, category, priority,
                   start_date, end_date, status, request_changes, approved_by, approved_date,
                   progress_notes, created_date, last_modified_date)
VALUES (2, 5, 2, 'Implement Automated Testing Framework',
        'Design and implement comprehensive automated testing framework for microservices with 80% code coverage',
        'TECHNICAL', 'HIGH', '2026-01-10', '2026-03-15', 'IN_PROGRESS', FALSE, 2, '2026-01-12 10:00:00',
        '2026-01-20 15:00:00: Completed framework selection - chose Jest + Supertest\n2026-02-05 14:20:00: Set up CI/CD pipeline integration, currently at 45% coverage',
        '2026-01-10 09:00:00', '2026-02-05 14:20:00');

-- -------------------------
-- SCENARIO 3: GOAL WITH CHANGES REQUESTED (needs employee revision)
-- -------------------------

INSERT INTO goals (goal_id, assigned_to_user_id, assigned_manager_id, title, description, category, priority,
                   start_date, end_date, status, request_changes, last_reviewed_by, last_reviewed_date,
                   created_date, last_modified_date)
VALUES (3, 6, 2, 'Improve Team Communication',
        'Enhance team communication processes',
        'BEHAVIORAL', 'MEDIUM', '2026-01-15', '2026-03-31', 'PENDING', TRUE, 2, '2026-01-16 14:30:00',
        '2026-01-15 11:00:00', '2026-01-16 14:30:00');

-- -------------------------
-- SCENARIO 4: PENDING APPROVAL GOAL (waiting for manager)
-- -------------------------

INSERT INTO goals (goal_id, assigned_to_user_id, assigned_manager_id, title, description, category, priority,
                   start_date, end_date, status, request_changes, created_date, last_modified_date)
VALUES (4, 8, 2, 'Learn React and Build Portfolio Project',
        'Complete React fundamentals course and build a full-stack portfolio application with authentication, database integration, and deployment',
        'PROFESSIONAL_DEVELOPMENT', 'MEDIUM', '2026-01-20', '2026-03-20', 'PENDING', FALSE,
        '2026-01-20 10:30:00', '2026-01-20 10:30:00');

-- -------------------------
-- SCENARIO 5: PENDING_COMPLETION_APPROVAL (submitted, waiting manager verification)
-- -------------------------

INSERT INTO goals (goal_id, assigned_to_user_id, assigned_manager_id, title, description, category, priority,
                   start_date, end_date, status, request_changes, approved_by, approved_date,
                   evidence_link, evidence_link_description, evidence_access_instructions, completion_notes,
                   evidence_link_verification_status, completion_approval_status, completion_submitted_date,
                   progress_notes, created_date, last_modified_date)
VALUES (5, 4, 2, 'Mentor Junior Developers',
        'Provide weekly mentoring sessions to 2 junior developers, covering code reviews, best practices, and career guidance',
        'BEHAVIORAL', 'MEDIUM', '2026-01-08', '2026-03-31', 'PENDING_COMPLETION_APPROVAL', FALSE, 2, '2026-01-09 09:00:00',
        'https://drive.google.com/folder/mentoring-q1-2026',
        'Meeting notes from all mentoring sessions, feedback from mentees, code review examples',
        'Accessible to @company.com domain',
        'Conducted 8 weekly mentoring sessions with Arjun and another junior developer. Covered topics including code reviews, design patterns, testing strategies, and career development. Both mentees report significant improvement in their skills.',
        'NOT_VERIFIED', 'PENDING', '2026-02-18 11:45:00',
        '2026-01-15 16:00:00: Conducted first mentoring session with Arjun - covered code review best practices\n2026-01-22 16:00:00: Second session - discussed design patterns\n2026-02-05 16:00:00: Weekly sessions ongoing, both mentees showing good progress',
        '2026-01-08 14:00:00', '2026-02-18 11:45:00');

-- -------------------------
-- SCENARIO 6: REJECTED COMPLETION (needs additional evidence)
-- -------------------------

INSERT INTO goals (goal_id, assigned_to_user_id, assigned_manager_id, title, description, category, priority,
                   start_date, end_date, status, request_changes, approved_by, approved_date,
                   evidence_link, evidence_link_description, evidence_access_instructions, completion_notes,
                   evidence_link_verification_status, evidence_link_verification_notes, evidence_link_verified_by, evidence_link_verified_date,
                   completion_approval_status, completion_submitted_date,
                   progress_notes, created_date, last_modified_date)
VALUES (6, 5, 2, 'Reduce Bug Count by 40%',
        'Implement systematic approach to reduce production bugs by 40% through better testing and code reviews',
        'TECHNICAL', 'HIGH', '2026-01-12', '2026-03-10', 'IN_PROGRESS', FALSE, 2, '2026-01-13 11:00:00',
        'https://drive.google.com/folder/bug-reduction-metrics',
        'Bug tracking dashboard showing reduction metrics',
        'Accessible to engineering team',
        'Reduced production bugs by 25% through improved code review process.',
        'NEEDS_ADDITIONAL_LINK',
        'Current evidence shows 25% reduction, not the 40% target. Please continue working on this goal and provide additional evidence when you reach the 40% target.',
        2, '2026-02-12 15:00:00',
        'ADDITIONAL_EVIDENCE_REQUIRED', '2026-02-10 16:00:00',
        '2026-01-25 14:00:00: Implemented stricter code review checklist\n2026-02-12 15:20:00: Bug count reduced by 25% so far, continuing efforts',
        '2026-01-12 10:00:00', '2026-02-12 15:20:00');

-- -------------------------
-- SCENARIO 7: HR EMPLOYEE GOAL (Different Department)
-- -------------------------

INSERT INTO goals (goal_id, assigned_to_user_id, assigned_manager_id, title, description, category, priority,
                   start_date, end_date, status, request_changes, approved_by, approved_date,
                   progress_notes, created_date, last_modified_date)
VALUES (7, 7, 3, 'Streamline Onboarding Process',
        'Reduce new employee onboarding time from 2 weeks to 1 week by creating comprehensive documentation and automated workflows',
        'OTHER', 'HIGH', '2026-01-15', '2026-03-20', 'IN_PROGRESS', FALSE, 3, '2026-01-16 14:00:00',
        '2026-01-25 11:00:00: Created onboarding checklist template\n2026-02-01 10:30:00: Automated account creation workflow completed',
        '2026-01-15 09:00:00', '2026-02-01 10:30:00');

-- -------------------------
-- SCENARIO 8: LOW PRIORITY GOAL
-- -------------------------

INSERT INTO goals (goal_id, assigned_to_user_id, assigned_manager_id, title, description, category, priority,
                   start_date, end_date, status, request_changes, approved_by, approved_date,
                   progress_notes, created_date, last_modified_date)
VALUES (8, 8, 2, 'Improve Documentation Skills',
        'Take technical writing course and document 3 internal processes with clear diagrams and examples',
        'PROFESSIONAL_DEVELOPMENT', 'LOW', '2026-02-01', '2026-03-31', 'IN_PROGRESS', FALSE, 2, '2026-02-02 10:00:00',
        '2026-02-15 16:00:00: Enrolled in Udemy technical writing course, 30% complete',
        '2026-02-01 14:00:00', '2026-02-15 16:00:00');

-- ============================================================================
-- GOAL COMPLETION APPROVALS
-- ============================================================================

-- Goal Completion Approval for Goal 1 (APPROVED)
INSERT INTO goal_completion_approvals (approval_id, goal_id, approval_decision, approved_by, approval_date, manager_comments, evidence_link_verified, created_date)
VALUES (1, 1, 'APPROVED', 2, '2026-02-25 16:30:00',
        'Excellent work, Rahul! You not only met but exceeded the 30% target with a 35% improvement. Your implementation of Redis caching was particularly impressive. The documentation is thorough and will be valuable for the team. Well done!',
        TRUE, '2026-02-25 16:30:00');

-- Goal Completion Approval for Goal 6 (ADDITIONAL_EVIDENCE_REQUIRED)
INSERT INTO goal_completion_approvals (approval_id, goal_id, approval_decision, approved_by, approval_date, manager_comments, evidence_link_verified, created_date)
VALUES (2, 6, 'ADDITIONAL_EVIDENCE_REQUIRED', 2, '2026-02-12 15:20:00',
        'Good progress, Anita! You have achieved 25% reduction which is commendable. However, the goal was 40%. Please continue your efforts and resubmit when you reach the target. Consider adding more automated tests to supplement the code review process.',
        FALSE, '2026-02-12 15:20:00');

-- ============================================================================
-- PERFORMANCE REVIEWS
-- ============================================================================

-- -------------------------
-- SCENARIO 1: COMPLETED AND ACKNOWLEDGED REVIEW (Rahul - Q4 2025)
-- -------------------------

INSERT INTO performance_reviews (review_id, cycle_id, user_id, reviewed_by, acknowledged_by,
                                 self_assessment, employee_self_rating,
                                 manager_feedback, manager_rating, rating_justification,
                                 compensation_recommendations, next_period_goals, employee_response,
                                 status, submitted_date, review_completed_date, acknowledged_date,
                                 created_date, last_modified_date)
VALUES (1, 2, 4, 2, 4,
        '{"achievements":"Successfully completed API optimization project with 35% improvement, exceeding target. Mentored 2 junior developers throughout the quarter.","challenges":"Initially struggled with Redis configuration but overcame it through documentation and experimentation.","learnings":"Learned advanced caching strategies and improved mentoring skills.","areas_for_improvement":"Want to improve public speaking for tech talks."}',
        4,
        '{"strengths":"Exceptional technical skills, consistently exceeds targets. Great team player and natural mentor.","improvements":"Could benefit from more cross-team collaboration and presenting at team meetings.","highlights":"API optimization project was outstanding - 35% improvement vs 30% target shows excellent problem-solving."}',
        4,
        'Rahul consistently delivers high-quality work and exceeds expectations. His mentoring of junior developers has been invaluable to the team.',
        '{"merit_increase":"5-7%","bonus":2500,"promotion":"Consider for Senior Engineer role in Q3"}',
        'Lead the microservices migration project, present 2 tech talks to the engineering team',
        'Thank you for the feedback and recognition! I am excited about the microservices migration project and will work on improving my presentation skills through the tech talks.',
        'COMPLETED_AND_ACKNOWLEDGED',
        '2025-12-20 14:00:00', '2025-12-28 16:30:00', '2026-01-02 09:15:00',
        '2025-12-20 14:00:00', '2026-01-02 09:15:00');

-- -------------------------
-- SCENARIO 2: SELF_ASSESSMENT_COMPLETED (Anita - Q4 2025)
-- -------------------------

INSERT INTO performance_reviews (review_id, cycle_id, user_id,
                                 self_assessment, employee_self_rating,
                                 status, submitted_date, created_date, last_modified_date)
VALUES (2, 2, 5,
        '{"achievements":"Made significant progress on automated testing framework. Reduced bug count by 25%.","challenges":"Testing framework took longer than expected due to learning curve.","learnings":"Learned Jest, Supertest, and CI/CD integration.","areas_for_improvement":"Need to improve time estimation for complex projects."}',
        3,
        'SELF_ASSESSMENT_COMPLETED',
        '2025-12-22 10:30:00', '2025-12-22 10:30:00', '2025-12-22 10:30:00');

-- -------------------------
-- SCENARIO 3: PENDING REVIEW (Vikram - Q4 2025)
-- -------------------------

INSERT INTO performance_reviews (review_id, cycle_id, user_id, status, created_date, last_modified_date)
VALUES (3, 2, 6, 'PENDING', '2025-12-15 09:00:00', '2025-12-15 09:00:00');

-- -------------------------
-- SCENARIO 4: COMPLETED AND ACKNOWLEDGED (Meera - HR - Q4 2025)
-- -------------------------

INSERT INTO performance_reviews (review_id, cycle_id, user_id, reviewed_by, acknowledged_by,
                                 self_assessment, employee_self_rating,
                                 manager_feedback, manager_rating, rating_justification,
                                 compensation_recommendations, next_period_goals, employee_response,
                                 status, submitted_date, review_completed_date, acknowledged_date,
                                 created_date, last_modified_date)
VALUES (4, 2, 7, 3, 7,
        '{"achievements":"Successfully processed 25 new hires with zero errors. Improved onboarding satisfaction score from 3.5 to 4.2.","challenges":"Managing high volume during Q4 hiring push.","learnings":"Better time management and prioritization skills."}',
        4,
        '{"strengths":"Detail-oriented, excellent organizational skills, great with new hires.","improvements":"Could delegate more routine tasks."}',
        4,
        'Meera handled the Q4 hiring push excellently. Her attention to detail ensured smooth onboarding for all new employees.',
        '{"merit_increase":"4-6%","bonus":2000}',
        'Take lead on Q1 onboarding process improvements, mentor new HR coordinator',
        'Thank you! I am excited to work on process improvements and mentor the new coordinator.',
        'COMPLETED_AND_ACKNOWLEDGED',
        '2025-12-18 15:00:00', '2025-12-27 11:00:00', '2025-12-30 14:20:00',
        '2025-12-18 15:00:00', '2025-12-30 14:20:00');

-- ============================================================================
-- PERFORMANCE REVIEW GOALS (Linking Table)
-- ============================================================================

-- Link Goal 1 (COMPLETED) to Performance Review 1
INSERT INTO performance_review_goals (link_id, review_id, goal_id, linked_date)
VALUES (1, 1, 1, '2025-12-20 14:00:00');

-- ============================================================================
-- FEEDBACK
-- ============================================================================

-- Feedback for Goal 1 (Completed goal)
INSERT INTO feedback (feedback_id, goal_id, review_id, given_by_user_id, comments, feedback_type, date)
VALUES (1, 1, NULL, 2,
        'Outstanding work on the API optimization! Your systematic approach and thorough documentation set a great example for the team.',
        'POSITIVE', '2026-02-25 16:35:00');

-- Feedback for Goal 3 (Changes requested)
INSERT INTO feedback (feedback_id, goal_id, review_id, given_by_user_id, comments, feedback_type, date)
VALUES (2, 3, NULL, 2,
        'Please be more specific about what communication processes you want to improve and add measurable success criteria. For example: "Reduce Slack response time to under 2 hours" or "Conduct weekly team syncs with 90% attendance".',
        'CONSTRUCTIVE', '2026-01-16 14:30:00');

-- Feedback for Performance Review 1
INSERT INTO feedback (feedback_id, goal_id, review_id, given_by_user_id, comments, feedback_type, date)
VALUES (3, NULL, 1, 2,
        'Your growth this quarter has been remarkable. Keep up the excellent work and I look forward to seeing you lead the microservices project!',
        'POSITIVE', '2025-12-28 16:35:00');

-- Additional feedback for in-progress goals
INSERT INTO feedback (feedback_id, goal_id, review_id, given_by_user_id, comments, feedback_type, date)
VALUES
(4, 2, NULL, 2, 'Great progress on the testing framework! Your CI/CD integration is particularly well done.', 'POSITIVE', '2026-02-06 14:00:00'),
(5, 7, NULL, 3, 'The onboarding checklist you created is excellent. Very comprehensive and easy to follow.', 'POSITIVE', '2026-02-02 10:00:00'),
(6, 8, NULL, 2, 'Good initiative on improving documentation skills. This will benefit the entire team.', 'POSITIVE', '2026-02-16 09:00:00');

-- ============================================================================
-- REPORTS
-- ============================================================================

INSERT INTO reports (report_id, scope, metrics, format, generated_by, generated_date, file_path)
VALUES
(1, 'Company-wide Q4 2025 Performance Summary',
 '{"total_employees":7,"reviews_completed":2,"avg_self_rating":3.75,"avg_manager_rating":4.0,"goals_completed":1,"goals_in_progress":7}',
 'PDF', 1, '2026-01-05 10:00:00', '/reports/q4-2025-company-performance.pdf'),
(2, 'Engineering Team Q1 2026 Goal Progress',
 '{"team_size":4,"total_goals":6,"completed":1,"in_progress":4,"pending_approval":1,"completion_rate":16.67}',
 'PDF', 2, '2026-02-20 15:00:00', '/reports/engineering-q1-2026-goals.pdf');

-- ============================================================================
-- DATA SUMMARY
-- ============================================================================

SELECT '=== CORE-SERVICE DATA SUMMARY ===' AS 'STATUS';

SELECT '=== REVIEW CYCLES ===' AS '';
SELECT title, status, start_date, end_date FROM review_cycles;

SELECT '=== GOALS BY STATUS ===' AS '';
SELECT status, COUNT(*) as count FROM goals GROUP BY status;

SELECT '=== GOALS BY PRIORITY ===' AS '';
SELECT priority, COUNT(*) as count FROM goals GROUP BY priority;

SELECT '=== PERFORMANCE REVIEWS ===' AS '';
SELECT status, COUNT(*) as count FROM performance_reviews GROUP BY status;

SELECT '=== FEEDBACK ===' AS '';
SELECT feedback_type, COUNT(*) as count FROM feedback GROUP BY feedback_type;

COMMIT;

-- ============================================================================
-- SEED DATA COMPLETE
-- ============================================================================
SELECT '✅ Core-Service database populated successfully!' AS 'STATUS';
SELECT 'Total Review Cycles: 2' AS 'INFO';
SELECT 'Total Goals: 8 (various statuses)' AS 'INFO';
SELECT 'Total Reviews: 4 (various stages)' AS 'INFO';
SELECT 'Total Feedback: 6 entries' AS 'INFO';
SELECT 'Total Reports: 2' AS 'INFO';
