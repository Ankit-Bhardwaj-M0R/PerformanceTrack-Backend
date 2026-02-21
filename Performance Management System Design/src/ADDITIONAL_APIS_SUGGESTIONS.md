# Additional API Suggestions for PerformanceTrack

## Current Status: 47 Core APIs Implemented ✓

Below are **23 additional APIs** that would enhance the PerformanceTrack system with advanced features:

---

## 1. BULK OPERATIONS (5 APIs)

### API 48: Bulk Approve Goals
**Method:** POST  
**URL:** `/api/v1/goals/bulk-approve`  
**Use Case:** Manager approves multiple goals at once  
**Body:**
```json
{
  "goalIds": [1, 2, 3, 4, 5]
}
```
**Response:** Success count and details of each approval

---

### API 49: Bulk Request Changes
**Method:** POST  
**URL:** `/api/v1/goals/bulk-request-changes`  
**Use Case:** Manager requests changes on multiple goals with same comment  
**Body:**
```json
{
  "goalIds": [1, 2, 3],
  "comments": "Please add more specific metrics and timelines"
}
```

---

### API 50: Bulk Assign Manager
**Method:** PUT  
**URL:** `/api/v1/users/bulk-assign-manager`  
**Use Case:** Admin reassigns multiple employees to a new manager  
**Body:**
```json
{
  "userIds": [5, 6, 7, 8],
  "newManagerId": 2
}
```

---

### API 51: Bulk Delete Goals
**Method:** DELETE  
**URL:** `/api/v1/goals/bulk-delete`  
**Use Case:** Admin or manager removes multiple goals  
**Body:**
```json
{
  "goalIds": [10, 11, 12]
}
```

---

### API 52: Bulk Update Goal Priority
**Method:** PUT  
**URL:** `/api/v1/goals/bulk-update-priority`  
**Use Case:** Manager adjusts priority of multiple goals  
**Body:**
```json
{
  "goalIds": [1, 2, 3],
  "priority": "HIGH"
}
```

---

## 2. GOAL TEMPLATES (3 APIs)

### API 53: Create Goal Template
**Method:** POST  
**URL:** `/api/v1/goal-templates`  
**Use Case:** Admin creates reusable goal template  
**Body:**
```json
{
  "title": "Reduce API Response Time",
  "description": "Optimize {endpoint} by {percentage}% through {method}",
  "category": "TECHNICAL",
  "defaultPriority": "HIGH",
  "defaultDuration": 90,
  "requiredFields": ["endpoint", "percentage", "method"]
}
```

---

### API 54: Get All Goal Templates
**Method:** GET  
**URL:** `/api/v1/goal-templates`  
**Use Case:** Employee/Manager browses available templates

---

### API 55: Create Goal from Template
**Method:** POST  
**URL:** `/api/v1/goals/from-template`  
**Use Case:** Employee creates goal from template  
**Body:**
```json
{
  "templateId": 1,
  "variables": {
    "endpoint": "User API",
    "percentage": 30,
    "method": "Redis caching"
  },
  "startDt": "2026-02-01",
  "endDt": "2026-04-30"
}
```

---

## 3. ADVANCED ANALYTICS (4 APIs)

### API 56: Get Employee Performance Trends
**Method:** GET  
**URL:** `/api/v1/reports/employee-trends/{userId}`  
**Query Params:** `?period=6months`  
**Use Case:** View employee's performance over time  
**Response:**
```json
{
  "ratings": [3.5, 3.8, 4.0, 4.2],
  "completionRates": [75, 80, 85, 90],
  "periods": ["Q1 2025", "Q2 2025", "Q3 2025", "Q4 2025"]
}
```

---

### API 57: Get Goal Category Analytics
**Method:** GET  
**URL:** `/api/v1/reports/category-breakdown`  
**Use Case:** Admin views distribution and success rates by category  
**Response:**
```json
{
  "categories": [
    {
      "name": "TECHNICAL",
      "total": 120,
      "completed": 95,
      "completionRate": 79,
      "avgDuration": 85
    }
  ]
}
```

---

### API 58: Get Team Comparison Report
**Method:** GET  
**URL:** `/api/v1/reports/team-comparison?managerId={id}`  
**Use Case:** Compare performance across different teams  
**Response:**
```json
{
  "teams": [
    {
      "managerName": "Jane Manager",
      "teamSize": 8,
      "avgRating": 4.1,
      "completionRate": 85
    }
  ]
}
```

---

### API 59: Get SLA Compliance Report
**Method:** GET  
**URL:** `/api/v1/reports/sla-compliance`  
**Use Case:** Track manager response times and SLA breaches  
**Response:**
```json
{
  "avgApprovalTime": 2.5,
  "breaches": 3,
  "onTimeApprovals": 42,
  "totalPending": 45
}
```

---

## 4. GOAL DEPENDENCIES (2 APIs)

### API 60: Add Goal Dependency
**Method:** POST  
**URL:** `/api/v1/goals/{goalId}/dependencies`  
**Use Case:** Mark that Goal B depends on Goal A completion  
**Body:**
```json
{
  "dependsOnGoalId": 1,
  "dependencyType": "BLOCKS"
}
```

---

### API 61: Get Goal Dependency Graph
**Method:** GET  
**URL:** `/api/v1/goals/{goalId}/dependency-graph`  
**Use Case:** View all related goals in dependency chain  
**Response:**
```json
{
  "goal": {...},
  "blockedBy": [1, 2],
  "blocks": [5, 6],
  "relatedGoals": [...]
}
```

---

## 5. SKILL ASSESSMENT (3 APIs)

### API 62: Create Skill Assessment
**Method:** POST  
**URL:** `/api/v1/skills/assess`  
**Use Case:** Manager assesses employee skills during review  
**Body:**
```json
{
  "userId": 3,
  "reviewId": 1,
  "skills": [
    {"name": "React", "level": 4, "notes": "Expert level"},
    {"name": "Node.js", "level": 3, "notes": "Proficient"}
  ]
}
```

---

### API 63: Get Employee Skills Profile
**Method:** GET  
**URL:** `/api/v1/skills/profile/{userId}`  
**Use Case:** View employee's skill ratings over time

---

### API 64: Get Team Skills Matrix
**Method:** GET  
**URL:** `/api/v1/skills/team-matrix/{managerId}`  
**Use Case:** Manager sees all team members' skills in grid view

---

## 6. 1-ON-1 MEETINGS (2 APIs)

### API 65: Create 1-on-1 Note
**Method:** POST  
**URL:** `/api/v1/one-on-ones`  
**Use Case:** Manager/Employee records meeting notes  
**Body:**
```json
{
  "employeeId": 3,
  "managerId": 2,
  "date": "2026-01-22",
  "agenda": "Q1 goals review, career development",
  "notes": "Discussed progress on API optimization...",
  "actionItems": "Follow up on Redis documentation"
}
```

---

### API 66: Get 1-on-1 History
**Method:** GET  
**URL:** `/api/v1/one-on-ones?userId={id}`  
**Use Case:** View all past meeting notes

---

## 7. CAREER DEVELOPMENT (2 APIs)

### API 67: Create Career Development Plan
**Method:** POST  
**URL:** `/api/v1/career-plans`  
**Use Case:** Employee and manager create growth roadmap  
**Body:**
```json
{
  "userId": 3,
  "currentRole": "Senior Engineer",
  "targetRole": "Staff Engineer",
  "targetTimeline": "2027-01-01",
  "skillGaps": ["System Design", "Leadership"],
  "developmentGoals": [1, 2, 3]
}
```

---

### API 68: Get Career Plan Progress
**Method:** GET  
**URL:** `/api/v1/career-plans/{userId}`  
**Use Case:** Track progress toward career goals

---

## 8. RECOGNITION & AWARDS (2 APIs)

### API 69: Give Recognition
**Method:** POST  
**URL:** `/api/v1/recognition`  
**Use Case:** Manager or peer gives recognition/kudos  
**Body:**
```json
{
  "recipientId": 3,
  "type": "SPOT_AWARD",
  "category": "Technical Excellence",
  "message": "Outstanding work on API optimization project",
  "public": true
}
```

---

### API 70: Get Recognition History
**Method:** GET  
**URL:** `/api/v1/recognition?userId={id}`  
**Use Case:** View all recognitions received by employee

---

---

## Summary of Additional APIs

| Category | API Count | Purpose |
|----------|-----------|---------|
| Bulk Operations | 5 | Efficiency for managers/admins |
| Goal Templates | 3 | Standardization and speed |
| Advanced Analytics | 4 | Deeper insights |
| Goal Dependencies | 2 | Complex project tracking |
| Skill Assessment | 3 | Talent management |
| 1-on-1 Meetings | 2 | Manager-employee sync |
| Career Development | 2 | Long-term growth |
| Recognition & Awards | 2 | Employee engagement |
| **TOTAL** | **23** | **Complete ecosystem** |

---

## Implementation Priority

### High Priority (Immediate Value)
1. ✅ Bulk Approve Goals (API 48)
2. ✅ Goal Templates (APIs 53-55)
3. ✅ Performance Trends (API 56)
4. ✅ Team Comparison (API 58)

### Medium Priority (Enhanced Features)
5. Skill Assessment (APIs 62-64)
6. 1-on-1 Meetings (APIs 65-66)
7. Goal Dependencies (APIs 60-61)

### Low Priority (Nice to Have)
8. Career Development (APIs 67-68)
9. Recognition System (APIs 69-70)
10. Remaining Bulk Operations

---

## Integration with Existing System

All these APIs would integrate seamlessly with the existing 47-API foundation:

- Use same authentication system (Bearer token)
- Follow same response format (`{status, msg, data}`)
- Maintain same role-based access control
- Leverage existing database schema with new tables:
  - `GoalTemplates`
  - `GoalDependencies`
  - `SkillAssessments`
  - `OneOnOneMeetings`
  - `CareerPlans`
  - `Recognition`

---

## Database Schema Additions

### New Tables Required:

```sql
-- Goal Templates
CREATE TABLE GoalTemplates (
  TemplateID INT PRIMARY KEY,
  Title VARCHAR(255),
  DescriptionTemplate TEXT,
  Category VARCHAR(50),
  DefaultPriority VARCHAR(20),
  DefaultDurationDays INT,
  RequiredVariables JSON,
  CreatedBy INT REFERENCES User(UserID),
  CreatedDate DATETIME
);

-- Goal Dependencies
CREATE TABLE GoalDependencies (
  DependencyID INT PRIMARY KEY,
  GoalID INT REFERENCES Goal(GoalID),
  DependsOnGoalID INT REFERENCES Goal(GoalID),
  DependencyType VARCHAR(50), -- BLOCKS, REQUIRES, RELATED
  CreatedDate DATETIME
);

-- Skill Assessments
CREATE TABLE SkillAssessments (
  AssessmentID INT PRIMARY KEY,
  UserID INT REFERENCES User(UserID),
  ReviewID INT REFERENCES PerformanceReview(ReviewID),
  SkillName VARCHAR(100),
  Level INT, -- 1-5 scale
  Notes TEXT,
  AssessedBy INT REFERENCES User(UserID),
  AssessedDate DATETIME
);

-- 1-on-1 Meetings
CREATE TABLE OneOnOneMeetings (
  MeetingID INT PRIMARY KEY,
  EmployeeID INT REFERENCES User(UserID),
  ManagerID INT REFERENCES User(UserID),
  MeetingDate DATE,
  Agenda TEXT,
  Notes TEXT,
  ActionItems TEXT,
  CreatedDate DATETIME
);

-- Career Plans
CREATE TABLE CareerPlans (
  PlanID INT PRIMARY KEY,
  UserID INT REFERENCES User(UserID),
  CurrentRole VARCHAR(100),
  TargetRole VARCHAR(100),
  TargetDate DATE,
  SkillGaps JSON,
  Status VARCHAR(50),
  CreatedDate DATETIME,
  LastUpdated DATETIME
);

-- Recognition
CREATE TABLE Recognition (
  RecognitionID INT PRIMARY KEY,
  RecipientID INT REFERENCES User(UserID),
  GivenBy INT REFERENCES User(UserID),
  Type VARCHAR(50), -- SPOT_AWARD, PEER_RECOGNITION, etc.
  Category VARCHAR(100),
  Message TEXT,
  Public BOOLEAN,
  CreatedDate DATETIME
);
```

---

**Total System: 70 APIs (47 Core + 23 Additional)**

This would make PerformanceTrack a comprehensive, enterprise-grade performance management platform! 🚀
