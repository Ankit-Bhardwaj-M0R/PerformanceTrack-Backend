import React, { useState } from 'react';
import { Login } from './components/auth/Login';
import { EmployeeDashboard } from './components/employee/EmployeeDashboard';
import { ManagerDashboard } from './components/manager/ManagerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { GoalsList } from './components/employee/GoalsList';
import { GoalDetail } from './components/employee/GoalDetail';
import { ReviewsList } from './components/employee/ReviewsList';
import { ReviewDetail } from './components/employee/ReviewDetail';
import { SelfAssessment } from './components/employee/SelfAssessment';
import { Feedback } from './components/employee/Feedback';
import { TeamGoals } from './components/manager/TeamGoals';
import { GoalApproval } from './components/manager/GoalApproval';
import { VerifyEvidence } from './components/manager/VerifyEvidence';
import { TeamMembers } from './components/manager/TeamMembers';
import { TeamMemberDetail } from './components/manager/TeamMemberDetail';
import { ManagerReviews } from './components/manager/ManagerReviews';
import { ManagerReports } from './components/manager/ManagerReports';
import { ManagerReviewDetail } from './components/manager/ManagerReviewDetail';
import { UserManagement } from './components/admin/UserManagement';
import { ReviewCycles } from './components/admin/ReviewCycles';
import { AuditLogs } from './components/admin/AuditLogs';
import { Analytics } from './components/admin/Analytics';
import { Notifications } from './components/shared/Notifications';
import { Navigation } from './components/shared/Navigation';
import { ThemeProvider } from './context/ThemeContext';

export type UserRole = 'EMPLOYEE' | 'MANAGER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  department: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('login');
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
    setSelectedGoalId(null);
    setSelectedReviewId(null);
    setSelectedMemberId(null);
  };

  const handleNavigate = (view: string, id?: number) => {
    setCurrentView(view);
    if (id !== undefined) {
      if (view === 'goal-detail') setSelectedGoalId(id);
      if (view === 'review-detail') setSelectedReviewId(id);
      if (view === 'manager-review-detail') setSelectedReviewId(id);
      if (view === 'goal-approval') setSelectedGoalId(id);
      if (view === 'verify-evidence') setSelectedGoalId(id);
      if (view === 'team-member-detail') setSelectedMemberId(id);
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navigation 
          user={currentUser} 
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          currentView={currentView}
        />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {currentView === 'dashboard' && currentUser.role === 'EMPLOYEE' && (
            <EmployeeDashboard user={currentUser} onNavigate={handleNavigate} />
          )}
          {currentView === 'dashboard' && currentUser.role === 'MANAGER' && (
            <ManagerDashboard user={currentUser} onNavigate={handleNavigate} />
          )}
          {currentView === 'dashboard' && currentUser.role === 'ADMIN' && (
            <AdminDashboard user={currentUser} onNavigate={handleNavigate} />
          )}
          
          {/* Employee Views */}
          {currentView === 'my-goals' && <GoalsList user={currentUser} onNavigate={handleNavigate} />}
          {currentView === 'goal-detail' && selectedGoalId && (
            <GoalDetail goalId={selectedGoalId} user={currentUser} onNavigate={handleNavigate} />
          )}
          {currentView === 'my-reviews' && <ReviewsList user={currentUser} onNavigate={handleNavigate} />}
          {currentView === 'review-detail' && selectedReviewId && (
            <ReviewDetail reviewId={selectedReviewId} user={currentUser} onNavigate={handleNavigate} />
          )}
          {currentView === 'self-assessment' && <SelfAssessment user={currentUser} onNavigate={handleNavigate} />}
          {currentView === 'feedback' && <Feedback user={currentUser} onNavigate={handleNavigate} />}
          
          {/* Manager Views */}
          {currentView === 'team-goals' && <TeamGoals user={currentUser} onNavigate={handleNavigate} />}
          {currentView === 'goal-approval' && selectedGoalId && (
            <GoalApproval goalId={selectedGoalId} user={currentUser} onNavigate={handleNavigate} />
          )}
          {currentView === 'verify-evidence' && selectedGoalId && (
            <VerifyEvidence goalId={selectedGoalId} user={currentUser} onNavigate={handleNavigate} />
          )}
          {currentView === 'team-members' && <TeamMembers user={currentUser} onNavigate={handleNavigate} />}
          {currentView === 'team-member-detail' && selectedMemberId && (
            <TeamMemberDetail memberId={selectedMemberId} user={currentUser} onNavigate={handleNavigate} />
          )}
          {currentView === 'manager-reviews' && <ManagerReviews user={currentUser} onNavigate={handleNavigate} />}
          {currentView === 'manager-reports' && <ManagerReports user={currentUser} />}
          {currentView === 'manager-review-detail' && selectedReviewId && (
            <ManagerReviewDetail reviewId={selectedReviewId} user={currentUser} onNavigate={handleNavigate} />
          )}
          
          {/* Admin Views */}
          {currentView === 'users' && <UserManagement />}
          {currentView === 'review-cycles' && <ReviewCycles />}
          {currentView === 'audit-logs' && <AuditLogs />}
          {currentView === 'analytics' && <Analytics />}
          
          {/* Shared Views */}
          {currentView === 'notifications' && <Notifications user={currentUser} />}
        </main>
      </div>
    </ThemeProvider>
  );
}