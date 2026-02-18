-- ============================================================================
-- AUTH-USER-SERVICE SEED DATA
-- ============================================================================
-- This seed data is extracted from the monolith data.sql
-- and adapted for the auth-user-service microservice
-- ============================================================================

-- Clean existing data (if any)
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE audit_logs;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- USERS DATA
-- ============================================================================

-- Admin User (ID: 1)
INSERT INTO users (user_id, name, email, password_hash, role, department, manager_id, status, created_date, last_modified_date)
VALUES (1, 'Sam Admin', 'admin@company.com',
        '$2a$12$cuwUGL7fPBnYYc4CVRyhVOW3SJq0kPCk8mgZhe/mlrdd0TRmL0Siq',
        'ADMIN', 'Administration', NULL, 'ACTIVE', '2025-12-01 09:00:00', '2025-12-01 09:00:00');

-- Manager 1: Priya Patel - Engineering Manager (ID: 2)
INSERT INTO users (user_id, name, email, password_hash, role, department, manager_id, status, created_date, last_modified_date)
VALUES (2, 'Priya Patel', 'priya@company.com',
        '$2a$12$RfB6cfXm2p.RAymvYJM6y.l0NK94rk/iG9BFGl6K9skp8DDywrBtO',
        'MANAGER', 'Engineering', NULL, 'ACTIVE', '2025-12-01 09:15:00', '2025-12-01 09:15:00');

-- Manager 2: Sarah Wilson - HR Manager (ID: 3)
INSERT INTO users (user_id, name, email, password_hash, role, department, manager_id, status, created_date, last_modified_date)
VALUES (3, 'Sarah Wilson', 'sarah@company.com',
        '$2a$12$RfB6cfXm2p.RAymvYJM6y.l0NK94rk/iG9BFGl6K9skp8DDywrBtO',
        'MANAGER', 'HR', NULL, 'ACTIVE', '2025-12-01 09:20:00', '2025-12-01 09:20:00');

-- Employee 1: Rahul Sharma - Software Engineer (ID: 4)
INSERT INTO users (user_id, name, email, password_hash, role, department, manager_id, status, created_date, last_modified_date)
VALUES (4, 'Rahul Sharma', 'rahul@company.com',
        '$2a$12$99tF8GiIxfpak3KaFlY2BO0PHDHy5u8SwkAZZNSGMHi9GSVZ3Ox5e',
        'EMPLOYEE', 'Engineering', 2, 'ACTIVE', '2025-12-01 10:00:00', '2025-12-01 10:00:00');

-- Employee 2: Anita Desai - Senior Developer (ID: 5)
INSERT INTO users (user_id, name, email, password_hash, role, department, manager_id, status, created_date, last_modified_date)
VALUES (5, 'Anita Desai', 'anita@company.com',
        '$2a$12$99tF8GiIxfpak3KaFlY2BO0PHDHy5u8SwkAZZNSGMHi9GSVZ3Ox5e',
        'EMPLOYEE', 'Engineering', 2, 'ACTIVE', '2025-12-01 10:05:00', '2025-12-01 10:05:00');

-- Employee 3: Vikram Singh - QA Engineer (ID: 6)
INSERT INTO users (user_id, name, email, password_hash, role, department, manager_id, status, created_date, last_modified_date)
VALUES (6, 'Vikram Singh', 'vikram@company.com',
        '$2a$12$rXOOqlWY0sWrYr.mF.YwTezBp108y2Eh5KQBIbm2OVqe.0uBtQYAK',
        'EMPLOYEE', 'Engineering', 2, 'ACTIVE', '2025-12-01 10:10:00', '2025-12-01 10:10:00');

-- Employee 4: Meera Reddy - HR Specialist (ID: 7)
INSERT INTO users (user_id, name, email, password_hash, role, department, manager_id, status, created_date, last_modified_date)
VALUES (7, 'Meera Reddy', 'meera@company.com',
        '$2a$12$99tF8GiIxfpak3KaFlY2BO0PHDHy5u8SwkAZZNSGMHi9GSVZ3Ox5e',
        'EMPLOYEE', 'HR', 3, 'ACTIVE', '2025-12-01 10:15:00', '2025-12-01 10:15:00');

-- Employee 5: Arjun Kumar - Junior Developer (ID: 8)
INSERT INTO users (user_id, name, email, password_hash, role, department, manager_id, status, created_date, last_modified_date)
VALUES (8, 'Arjun Kumar', 'arjun@company.com',
        '$2a$12$99tF8GiIxfpak3KaFlY2BO0PHDHy5u8SwkAZZNSGMHi9GSVZ3Ox5e',
        'EMPLOYEE', 'Engineering', 2, 'ACTIVE', '2025-12-01 10:20:00', '2025-12-01 10:20:00');

-- ============================================================================
-- AUDIT LOGS DATA
-- ============================================================================

-- User creation audit logs
INSERT INTO audit_logs (user_id, action, details, related_entity_type, related_entity_id, timestamp)
VALUES (1, 'CREATE', 'Admin user created during system setup', 'USER', 1, '2025-12-01 09:00:00');

INSERT INTO audit_logs (user_id, action, details, related_entity_type, related_entity_id, timestamp)
VALUES (1, 'CREATE', 'Created manager: Priya Patel (Engineering)', 'USER', 2, '2025-12-01 09:15:00');

INSERT INTO audit_logs (user_id, action, details, related_entity_type, related_entity_id, timestamp)
VALUES (1, 'CREATE', 'Created manager: Sarah Wilson (HR)', 'USER', 3, '2025-12-01 09:20:00');

INSERT INTO audit_logs (user_id, action, details, related_entity_type, related_entity_id, timestamp)
VALUES (1, 'CREATE', 'Created employee: Rahul Sharma (Engineering, Manager: Priya Patel)', 'USER', 4, '2025-12-01 10:00:00');

INSERT INTO audit_logs (user_id, action, details, related_entity_type, related_entity_id, timestamp)
VALUES (1, 'CREATE', 'Created employee: Anita Desai (Engineering, Manager: Priya Patel)', 'USER', 5, '2025-12-01 10:05:00');

INSERT INTO audit_logs (user_id, action, details, related_entity_type, related_entity_id, timestamp)
VALUES (1, 'CREATE', 'Created employee: Vikram Singh (Engineering, Manager: Priya Patel)', 'USER', 6, '2025-12-01 10:10:00');

INSERT INTO audit_logs (user_id, action, details, related_entity_type, related_entity_id, timestamp)
VALUES (1, 'CREATE', 'Created employee: Meera Reddy (HR, Manager: Sarah Wilson)', 'USER', 7, '2025-12-01 10:15:00');

INSERT INTO audit_logs (user_id, action, details, related_entity_type, related_entity_id, timestamp)
VALUES (1, 'CREATE', 'Created employee: Arjun Kumar (Engineering, Manager: Priya Patel)', 'USER', 8, '2025-12-01 10:20:00');

-- User login/logout audit logs
INSERT INTO audit_logs (user_id, action, details, related_entity_type, related_entity_id, timestamp)
VALUES
(4, 'LOGIN', 'User logged in', 'USER', 4, '2026-01-05 08:45:00'),
(2, 'LOGIN', 'User logged in', 'USER', 2, '2026-01-05 08:50:00'),
(5, 'LOGIN', 'User logged in', 'USER', 5, '2026-01-10 09:00:00'),
(4, 'LOGIN', 'User logged in', 'USER', 4, '2026-02-22 13:55:00'),
(4, 'LOGOUT', 'User logged out', 'USER', 4, '2026-02-22 17:30:00');

-- ============================================================================
-- DATA SUMMARY
-- ============================================================================

SELECT '=== AUTH-USER-SERVICE DATA SUMMARY ===' AS 'STATUS';
SELECT 'Total Users: 8 (1 Admin, 2 Managers, 5 Employees)' AS 'INFO';
SELECT CONCAT('Total Audit Logs: ', COUNT(*), ' entries') AS 'INFO' FROM audit_logs;

SELECT '=== USERS BY ROLE ===' AS '';
SELECT role, department, COUNT(*) as count FROM users GROUP BY role, department;

COMMIT;

-- ============================================================================
-- SEED DATA COMPLETE
-- ============================================================================
SELECT '✅ Auth-User-Service database populated successfully!' AS 'STATUS';
