-- ============================================================================
-- NOTIFICATION-SERVICE SEED DATA
-- ============================================================================
-- This seed data is extracted from the monolith data.sql
-- and adapted for the notification-service microservice
-- ============================================================================

-- Clean existing data (if any)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE notifications;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- NOTIFICATIONS DATA
-- ============================================================================

-- -------------------------
-- USER ACCOUNT CREATION NOTIFICATIONS
-- -------------------------

INSERT INTO notifications (user_id, message, type, status, created_date)
VALUES
(1, 'Welcome to PerformanceTrack! System setup completed successfully.', 'ACCOUNT_CREATED', 'READ', '2025-12-01 09:00:00'),
(2, 'Welcome to PerformanceTrack! Your manager account has been created.', 'ACCOUNT_CREATED', 'UNREAD', '2025-12-01 09:15:00'),
(3, 'Welcome to PerformanceTrack! Your manager account has been created.', 'ACCOUNT_CREATED', 'UNREAD', '2025-12-01 09:20:00'),
(4, 'Welcome to PerformanceTrack! Your account has been created. Your manager is Priya Patel.', 'ACCOUNT_CREATED', 'UNREAD', '2025-12-01 10:00:00'),
(5, 'Welcome to PerformanceTrack! Your account has been created. Your manager is Priya Patel.', 'ACCOUNT_CREATED', 'UNREAD', '2025-12-01 10:05:00'),
(6, 'Welcome to PerformanceTrack! Your account has been created. Your manager is Priya Patel.', 'ACCOUNT_CREATED', 'UNREAD', '2025-12-01 10:10:00'),
(7, 'Welcome to PerformanceTrack! Your account has been created. Your manager is Sarah Wilson.', 'ACCOUNT_CREATED', 'UNREAD', '2025-12-01 10:15:00'),
(8, 'Welcome to PerformanceTrack! Your account has been created. Your manager is Priya Patel.', 'ACCOUNT_CREATED', 'UNREAD', '2025-12-01 10:20:00');

-- -------------------------
-- REVIEW CYCLE NOTIFICATIONS
-- -------------------------

-- Q1 2026 Cycle creation notifications (sent to managers)
INSERT INTO notifications (user_id, message, type, status, created_date)
VALUES
(2, 'New review cycle "Q1 2026 Performance Review" has been created. Period: Jan 1 - Mar 31, 2026.', 'REVIEW_REMINDER', 'UNREAD', '2025-12-15 09:00:00'),
(3, 'New review cycle "Q1 2026 Performance Review" has been created. Period: Jan 1 - Mar 31, 2026.', 'REVIEW_REMINDER', 'UNREAD', '2025-12-15 09:00:00');

-- -------------------------
-- GOAL 1 NOTIFICATIONS (Completed Goal - Rahul)
-- -------------------------

INSERT INTO notifications (user_id, message, type, status, related_entity_type, related_entity_id, created_date)
VALUES
(4, 'Your goal "Reduce API Response Time by 30%" has been created and sent to your manager for approval.', 'GOAL_SUBMITTED', 'READ', 'GOAL', 1, '2026-01-05 10:00:00'),
(2, 'Rahul Sharma submitted a new goal "Reduce API Response Time by 30%" for your approval.', 'GOAL_SUBMITTED', 'READ', 'GOAL', 1, '2026-01-05 10:00:00'),
(4, 'Great news! Your manager approved your goal "Reduce API Response Time by 30%". You can now start working on it.', 'GOAL_APPROVED', 'READ', 'GOAL', 1, '2026-01-06 09:30:00'),
(4, 'You submitted completion evidence for "Reduce API Response Time by 30%". Your manager will review it soon.', 'GOAL_COMPLETION_SUBMITTED', 'READ', 'GOAL', 1, '2026-02-22 14:00:00'),
(2, 'Rahul Sharma submitted completion evidence for goal "Reduce API Response Time by 30%". Please verify.', 'GOAL_COMPLETION_SUBMITTED', 'READ', 'GOAL', 1, '2026-02-22 14:00:00'),
(4, 'Your evidence for "Reduce API Response Time by 30%" has been verified by your manager.', 'GOAL_COMPLETION_APPROVED', 'READ', 'GOAL', 1, '2026-02-23 10:30:00'),
(4, 'Congratulations! Your manager approved the completion of "Reduce API Response Time by 30%". Great job!', 'GOAL_COMPLETION_APPROVED', 'READ', 'GOAL', 1, '2026-02-25 16:30:00'),
(4, 'You received feedback from Priya Patel on your goal "Reduce API Response Time by 30%".', 'GOAL_APPROVED', 'UNREAD', 'GOAL', 1, '2026-02-25 16:35:00');

-- -------------------------
-- GOAL 2 NOTIFICATIONS (In Progress - Anita)
-- -------------------------

INSERT INTO notifications (user_id, message, type, status, related_entity_type, related_entity_id, created_date)
VALUES
(5, 'Your goal "Implement Automated Testing Framework" has been created.', 'GOAL_SUBMITTED', 'READ', 'GOAL', 2, '2026-01-10 09:00:00'),
(2, 'Anita Desai submitted a new goal for approval.', 'GOAL_SUBMITTED', 'READ', 'GOAL', 2, '2026-01-10 09:00:00'),
(5, 'Your manager approved your goal "Implement Automated Testing Framework".', 'GOAL_APPROVED', 'READ', 'GOAL', 2, '2026-01-12 10:00:00'),
(5, 'You received feedback from Priya Patel on your goal "Implement Automated Testing Framework".', 'GOAL_APPROVED', 'UNREAD', 'GOAL', 2, '2026-02-06 14:00:00');

-- -------------------------
-- GOAL 3 NOTIFICATIONS (Changes Requested - Vikram)
-- -------------------------

INSERT INTO notifications (user_id, message, type, status, related_entity_type, related_entity_id, created_date)
VALUES
(6, 'Your goal "Improve Team Communication" has been created.', 'GOAL_SUBMITTED', 'READ', 'GOAL', 3, '2026-01-15 11:00:00'),
(2, 'Vikram Singh submitted a new goal for approval.', 'GOAL_SUBMITTED', 'READ', 'GOAL', 3, '2026-01-15 11:00:00'),
(6, 'Your manager requested changes to your goal "Improve Team Communication". Please review the feedback and update.', 'GOAL_CHANGE_REQUESTED', 'UNREAD', 'GOAL', 3, '2026-01-16 14:30:00'),
(6, 'Reminder: Please update your goal "Improve Team Communication" based on manager feedback.', 'REVIEW_REMINDER', 'UNREAD', 'GOAL', 3, '2026-01-18 09:00:00');

-- -------------------------
-- GOAL 4 NOTIFICATIONS (Pending Approval - Arjun)
-- -------------------------

INSERT INTO notifications (user_id, message, type, status, related_entity_type, related_entity_id, created_date)
VALUES
(8, 'Your goal "Learn React and Build Portfolio Project" has been created and sent for approval.', 'GOAL_SUBMITTED', 'UNREAD', 'GOAL', 4, '2026-01-20 10:30:00'),
(2, 'Arjun Kumar submitted a new goal "Learn React and Build Portfolio Project" for your approval.', 'GOAL_SUBMITTED', 'UNREAD', 'GOAL', 4, '2026-01-20 10:30:00');

-- -------------------------
-- GOAL 5 NOTIFICATIONS (Pending Completion Approval - Rahul)
-- -------------------------

INSERT INTO notifications (user_id, message, type, status, related_entity_type, related_entity_id, created_date)
VALUES
(4, 'Your goal "Mentor Junior Developers" has been created.', 'GOAL_SUBMITTED', 'READ', 'GOAL', 5, '2026-01-08 14:00:00'),
(2, 'Rahul Sharma submitted a new goal for approval.', 'GOAL_SUBMITTED', 'READ', 'GOAL', 5, '2026-01-08 14:00:00'),
(4, 'Your manager approved your goal "Mentor Junior Developers".', 'GOAL_APPROVED', 'READ', 'GOAL', 5, '2026-01-09 09:00:00'),
(4, 'You submitted completion evidence for "Mentor Junior Developers".', 'GOAL_COMPLETION_SUBMITTED', 'UNREAD', 'GOAL', 5, '2026-02-18 11:45:00'),
(2, 'Rahul Sharma submitted completion evidence for "Mentor Junior Developers". Please verify.', 'GOAL_COMPLETION_SUBMITTED', 'UNREAD', 'GOAL', 5, '2026-02-18 11:45:00');

-- -------------------------
-- GOAL 6 NOTIFICATIONS (Additional Evidence Required - Anita)
-- -------------------------

INSERT INTO notifications (user_id, message, type, status, related_entity_type, related_entity_id, created_date)
VALUES
(5, 'Your manager requested additional evidence for "Reduce Bug Count by 40%". Please review the feedback.', 'ADDITIONAL_EVIDENCE_REQUIRED', 'UNREAD', 'GOAL', 6, '2026-02-12 15:20:00');

-- -------------------------
-- GOAL 7 NOTIFICATIONS (HR Employee - Meera)
-- -------------------------

INSERT INTO notifications (user_id, message, type, status, related_entity_type, related_entity_id, created_date)
VALUES
(7, 'Your goal "Streamline Onboarding Process" has been created.', 'GOAL_SUBMITTED', 'READ', 'GOAL', 7, '2026-01-15 09:00:00'),
(3, 'Meera Reddy submitted a new goal for approval.', 'GOAL_SUBMITTED', 'READ', 'GOAL', 7, '2026-01-15 09:00:00'),
(7, 'Your manager approved your goal "Streamline Onboarding Process".', 'GOAL_APPROVED', 'READ', 'GOAL', 7, '2026-01-16 14:00:00'),
(7, 'You received feedback from Sarah Wilson on your goal "Streamline Onboarding Process".', 'GOAL_APPROVED', 'UNREAD', 'GOAL', 7, '2026-02-02 10:00:00');

-- -------------------------
-- GOAL 8 NOTIFICATIONS (Low Priority - Arjun)
-- -------------------------

INSERT INTO notifications (user_id, message, type, status, related_entity_type, related_entity_id, created_date)
VALUES
(8, 'Your goal "Improve Documentation Skills" has been created.', 'GOAL_SUBMITTED', 'READ', 'GOAL', 8, '2026-02-01 14:00:00'),
(2, 'Arjun Kumar submitted a new goal for approval.', 'GOAL_SUBMITTED', 'READ', 'GOAL', 8, '2026-02-01 14:00:00'),
(8, 'Your manager approved your goal "Improve Documentation Skills".', 'GOAL_APPROVED', 'READ', 'GOAL', 8, '2026-02-02 10:00:00'),
(8, 'You received feedback from Priya Patel on your goal "Improve Documentation Skills".', 'GOAL_APPROVED', 'UNREAD', 'GOAL', 8, '2026-02-16 09:00:00');

-- -------------------------
-- PERFORMANCE REVIEW NOTIFICATIONS
-- -------------------------

-- Review 1: Rahul - Completed and Acknowledged
INSERT INTO notifications (user_id, message, type, status, related_entity_type, related_entity_id, created_date)
VALUES
(4, 'Your self-assessment for Q4 2025 has been submitted successfully.', 'SELF_ASSESSMENT_SUBMITTED', 'READ', 'PERFORMANCE_REVIEW', 1, '2025-12-20 14:00:00'),
(2, 'Rahul Sharma submitted self-assessment for Q4 2025. Please complete the review.', 'SELF_ASSESSMENT_SUBMITTED', 'READ', 'PERFORMANCE_REVIEW', 1, '2025-12-20 14:00:00'),
(4, 'Your Q4 2025 performance review is ready. Please review and acknowledge.', 'PERFORMANCE_REVIEW_COMPLETED', 'READ', 'PERFORMANCE_REVIEW', 1, '2025-12-28 16:30:00'),
(2, 'Rahul Sharma acknowledged the Q4 2025 performance review.', 'REVIEW_ACKNOWLEDGED', 'READ', 'PERFORMANCE_REVIEW', 1, '2026-01-02 09:15:00');

-- Review 2: Anita - Self Assessment Completed
INSERT INTO notifications (user_id, message, type, status, related_entity_type, related_entity_id, created_date)
VALUES
(5, 'Your self-assessment for Q4 2025 has been submitted successfully.', 'SELF_ASSESSMENT_SUBMITTED', 'READ', 'PERFORMANCE_REVIEW', 2, '2025-12-22 10:30:00'),
(2, 'Anita Desai submitted self-assessment for Q4 2025. Please complete the review.', 'SELF_ASSESSMENT_SUBMITTED', 'UNREAD', 'PERFORMANCE_REVIEW', 2, '2025-12-22 10:30:00');

-- Review 4: Meera - Completed and Acknowledged
INSERT INTO notifications (user_id, message, type, status, related_entity_type, related_entity_id, created_date)
VALUES
(7, 'Your self-assessment for Q4 2025 has been submitted successfully.', 'SELF_ASSESSMENT_SUBMITTED', 'READ', 'PERFORMANCE_REVIEW', 4, '2025-12-18 15:00:00'),
(3, 'Meera Reddy submitted self-assessment for Q4 2025. Please complete the review.', 'SELF_ASSESSMENT_SUBMITTED', 'READ', 'PERFORMANCE_REVIEW', 4, '2025-12-18 15:00:00'),
(7, 'Your Q4 2025 performance review is ready. Please review and acknowledge.', 'PERFORMANCE_REVIEW_COMPLETED', 'READ', 'PERFORMANCE_REVIEW', 4, '2025-12-27 11:00:00');

-- -------------------------
-- SYSTEM REMINDERS
-- -------------------------

-- Pending actions reminders
INSERT INTO notifications (user_id, message, type, status, created_date)
VALUES
(2, 'Reminder: You have 2 pending goal approvals from your team members.', 'REVIEW_REMINDER', 'UNREAD', '2026-01-21 09:00:00'),
(2, 'Reminder: Anita Desai\'s Q4 2025 performance review is pending your input.', 'REVIEW_REMINDER', 'UNREAD', '2026-01-03 09:00:00');

-- Cycle ending reminders
INSERT INTO notifications (user_id, message, type, status, created_date)
VALUES
(4, 'Q1 2026 review cycle ends in 30 days. Please ensure all your goals are on track.', 'REVIEW_REMINDER', 'UNREAD', '2026-03-01 09:00:00'),
(5, 'Q1 2026 review cycle ends in 30 days. Please ensure all your goals are on track.', 'REVIEW_REMINDER', 'UNREAD', '2026-03-01 09:00:00');

-- ============================================================================
-- DATA SUMMARY
-- ============================================================================

SELECT '=== NOTIFICATION-SERVICE DATA SUMMARY ===' AS 'STATUS';

SELECT '=== NOTIFICATIONS BY TYPE ===' AS '';
SELECT type, status, COUNT(*) as count FROM notifications GROUP BY type, status ORDER BY type, status;

SELECT '=== NOTIFICATIONS BY USER ===' AS '';
SELECT user_id, COUNT(*) as total_notifications,
       SUM(CASE WHEN status = 'UNREAD' THEN 1 ELSE 0 END) as unread_count,
       SUM(CASE WHEN status = 'READ' THEN 1 ELSE 0 END) as read_count
FROM notifications
GROUP BY user_id
ORDER BY user_id;

COMMIT;

-- ============================================================================
-- SEED DATA COMPLETE
-- ============================================================================
SELECT '✅ Notification-Service database populated successfully!' AS 'STATUS';
SELECT CONCAT('Total Notifications: ', COUNT(*), ' entries') AS 'INFO' FROM notifications;
SELECT 'Notification Types: Account Created, Goal Submitted, Goal Approved, Goal Completion, Review Reminders, and more' AS 'INFO';
