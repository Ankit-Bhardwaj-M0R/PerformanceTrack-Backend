# PerformanceTrack Frontend

A React + Vite frontend that connects to the PerformanceTrack microservices backend.

---

## Prerequisites

Make sure your backend services are running:
| Service | Port |
|---|---|
| Discovery Server (Eureka) | 8761 |
| API Gateway | 8092 |
| Auth-User Service | 8081 |
| Core Service | 8083 |
| Notification Service | 8082 |

---

## Setup & Run

```bash
# From the frontend/ directory:
npm install          # Install dependencies (only needed once)
npm run dev          # Start dev server at http://localhost:3000
```

The Vite dev server proxies all `/api` requests to `http://localhost:8092` (API Gateway).

---

## Tech Stack

| Library | Purpose |
|---|---|
| React 18 | UI framework |
| Vite | Build tool (fast dev server) |
| React Router v6 | Client-side navigation |
| Axios | HTTP API calls |
| Tailwind CSS | Styling |
| Recharts | Charts and analytics |
| react-hot-toast | Toast notifications |
| lucide-react | Icons |
| date-fns | Date formatting |

---

## Project Structure

```
src/
├── main.jsx                  # Entry point
├── App.jsx                   # Router + providers
├── index.css                 # Global Tailwind styles
│
├── services/                 # API call layer (one file per microservice)
│   ├── api.js                # Axios instance (attaches JWT token)
│   ├── authService.js        # Login, logout, change password
│   ├── userService.js        # CRUD for users
│   ├── goalService.js        # Goal lifecycle (7-phase workflow)
│   ├── reviewService.js      # Review cycles + performance reviews
│   ├── notificationService.js # Notifications + SSE streaming
│   ├── reportService.js      # Dashboard metrics + analytics
│   ├── feedbackService.js    # Feedback on goals/reviews
│   └── auditService.js       # Audit log queries
│
├── context/                  # Global state (React Context API)
│   ├── AuthContext.jsx        # Who is logged in? login/logout functions
│   └── NotificationContext.jsx # Real-time notifications via SSE
│
├── components/
│   ├── layout/               # App shell
│   │   ├── Layout.jsx        # Sidebar + Header wrapper
│   │   ├── Sidebar.jsx       # Left navigation (role-aware)
│   │   └── Header.jsx        # Top bar (notifications bell, user info)
│   └── common/               # Reusable UI components
│       ├── ProtectedRoute.jsx # Guards authenticated/role-restricted routes
│       ├── Modal.jsx          # Popup dialog
│       ├── LoadingSpinner.jsx # Loading state
│       ├── Pagination.jsx     # Page controls
│       └── StatusBadge.jsx    # Colored status labels
│
└── pages/                    # One file per page/screen
    ├── LoginPage.jsx          # Login form
    ├── DashboardPage.jsx      # Role-based overview
    ├── GoalsPage.jsx          # Full 7-phase goal workflow
    ├── PerformanceReviewsPage.jsx  # Self-assessment + manager review
    ├── ReviewCyclesPage.jsx   # Admin: manage review cycles
    ├── UsersPage.jsx          # Admin: manage user accounts
    ├── ReportsPage.jsx        # Charts + analytics + report generation
    ├── NotificationsPage.jsx  # Real-time SSE notifications
    ├── AuditLogsPage.jsx      # Admin: system audit trail
    └── ProfilePage.jsx        # View profile + change password
```

---

## Role-Based Access

| Page | ADMIN | MANAGER | EMPLOYEE |
|---|:---:|:---:|:---:|
| Dashboard | ✅ | ✅ | ✅ |
| Goals | ✅ | ✅ (team) | ✅ (own) |
| Performance Reviews | ✅ | ✅ | ✅ |
| Review Cycles | ✅ | ❌ | ❌ |
| Users | ✅ | ❌ | ❌ |
| Reports | ✅ | ✅ | ❌ |
| Notifications | ✅ | ✅ | ✅ |
| Audit Logs | ✅ | ❌ | ❌ |
| Profile | ✅ | ✅ | ✅ |

---

## API Gateway Endpoints Used

All requests go through `http://localhost:8092/api/v1/`

```
POST   /auth/login                         Login
POST   /auth/logout
PUT    /auth/change-password

GET    /users                              List all users
POST   /users                             Create user (Admin)
PUT    /users/{id}                        Update user
GET    /users/{id}/team                   Get team (Manager)

GET    /goals                             List goals (role-filtered)
POST   /goals                             Create goal (Employee)
PUT    /goals/{id}/approve               Manager approves
PUT    /goals/{id}/request-changes       Manager requests changes
POST   /goals/{id}/progress              Add progress (Employee)
POST   /goals/{id}/submit-completion     Submit for completion (Employee)
POST   /goals/{id}/approve-completion    Approve completion (Manager)
POST   /goals/{id}/reject-completion     Reject completion (Manager)
PUT    /goals/{id}/evidence/verify       Verify evidence (Manager)

GET    /review-cycles                    List cycles
POST   /review-cycles                   Create cycle (Admin)
GET    /review-cycles/active            Get active cycle

GET    /performance-reviews             List reviews
POST   /performance-reviews            Submit self-assessment (Employee)
PUT    /performance-reviews/{id}       Manager review
POST   /performance-reviews/{id}/acknowledge  Employee acknowledge

GET    /notifications                   List notifications
GET    /notifications/stream            SSE real-time stream
PUT    /notifications/{id}             Mark as read
PUT    /notifications/mark-all-read    Mark all as read

GET    /reports/dashboard              Dashboard metrics
GET    /reports/goal-analytics         Goal analytics
GET    /reports/performance-summary    Performance data
GET    /reports/department-performance Department stats
POST   /reports/generate              Generate report

GET    /audit-logs                     Audit trail (Admin)
POST   /audit-logs/export             Export logs (Admin)
```
