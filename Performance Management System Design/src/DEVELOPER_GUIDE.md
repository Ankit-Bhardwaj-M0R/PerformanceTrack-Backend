# PerformanceTrack - Developer Quick Reference Guide

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- React 18+
- Tailwind CSS v4

### Project Structure
```
/
├── App.tsx                          # Main app with routing
├── components/
│   ├── auth/
│   │   └── Login.tsx               # Login page with demo credentials
│   ├── employee/
│   │   ├── EmployeeDashboard.tsx   # Employee home page
│   │   ├── GoalsList.tsx           # Goals list with filters
│   │   ├── GoalDetail.tsx          # Goal details + progress
│   │   ├── CreateGoalModal.tsx     # Create new goal form
│   │   ├── ReviewsList.tsx         # Performance reviews list
│   │   ├── ReviewDetail.tsx        # Review details + acknowledgment
│   │   ├── SelfAssessment.tsx      # Self-assessment form
│   │   └── Feedback.tsx            # Feedback page
│   ├── manager/
│   │   ├── ManagerDashboard.tsx    # Manager home page
│   │   ├── TeamGoals.tsx           # Team goals overview
│   │   ├── GoalApproval.tsx        # Approve/request changes
│   │   ├── VerifyEvidence.tsx      # Verify goal completion
│   │   └── TeamMembers.tsx         # Team roster
│   ├── admin/
│   │   ├── AdminDashboard.tsx      # Admin home page
│   │   ├── UserManagement.tsx      # CRUD users
│   │   ├── ReviewCycles.tsx        # Manage review cycles
│   │   ├── AuditLogs.tsx           # Audit trail with filters
│   │   └── Analytics.tsx           # Reports and charts
│   └── shared/
│       ├── Navigation.tsx          # Top nav bar
│       └── Notifications.tsx       # Notifications page
├── ADDITIONAL_APIS_SUGGESTIONS.md  # 23 enhancement APIs
├── FIXES_COMPLETED.md              # Bug fixes documentation
└── DEVELOPER_GUIDE.md              # This file
```

---

## 🎨 Design System

### Colors
```javascript
// Primary
blue-600    #2563EB  // Buttons, links, active states
blue-50     #EFF6FF  // Light backgrounds

// Status Colors
green-600   #10B981  // Success, completed
green-100   #D1FAE5  // Success background
yellow-500  #F59E0B  // Warning, pending
yellow-100  #FEF3C7  // Warning background
red-600     #EF4444  // Error, high priority
red-100     #FEE2E2  // Error background
blue-600    #3B82F6  // In progress
blue-100    #DBEAFE  // In progress background

// Neutrals
gray-900    #111827  // Primary text
gray-600    #4B5563  // Secondary text
gray-300    #D1D5DB  // Borders
gray-50     #F9FAFB  // Backgrounds
```

### Status Badges
```jsx
// Component pattern for status badges
<span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
  {status.replace('_', ' ')}
</span>

// Helper function
const getStatusColor = (status: string) => {
  const colors: { [key: string]: string } = {
    PENDING: 'bg-gray-100 text-gray-700',
    APPROVED: 'bg-green-100 text-green-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-green-600 text-white',
    CHANGES_REQUESTED: 'bg-yellow-100 text-yellow-700',
  };
  return colors[status] || 'bg-gray-100 text-gray-700';
};
```

### Priority Badges
```jsx
const getPriorityColor = (priority: string) => {
  const colors: { [key: string]: string } = {
    Low: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    High: 'bg-red-100 text-red-700',
  };
  return colors[priority];
};
```

---

## 🔐 Authentication

### Demo Credentials
```javascript
const demoAccounts = [
  { 
    email: 'employee@test.com', 
    password: 'employee123', 
    role: 'EMPLOYEE',
    name: 'John Employee' 
  },
  { 
    email: 'manager@test.com', 
    password: 'manager123', 
    role: 'MANAGER',
    name: 'Jane Manager' 
  },
  { 
    email: 'admin@test.com', 
    password: 'admin123', 
    role: 'ADMIN',
    name: 'Sam Admin' 
  },
];
```

### Role-Based Access
```javascript
// In Navigation.tsx
const getNavLinks = () => {
  switch (user.role) {
    case 'EMPLOYEE':
      return [
        { label: 'Dashboard', view: 'dashboard' },
        { label: 'My Goals', view: 'my-goals' },
        { label: 'My Reviews', view: 'my-reviews' },
        { label: 'Feedback', view: 'feedback' },
      ];
    case 'MANAGER':
      return [...]; // Manager links
    case 'ADMIN':
      return [...]; // Admin links
  }
};
```

---

## 🔄 Navigation System

### How Routing Works
```javascript
// App.tsx manages all routing
const [currentView, setCurrentView] = useState('login');
const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

const handleNavigate = (view: string, id?: number) => {
  setCurrentView(view);
  if (id !== undefined) {
    if (view === 'goal-detail') setSelectedGoalId(id);
    if (view === 'review-detail') setSelectedReviewId(id);
  }
};

// Components call onNavigate
<button onClick={() => onNavigate('goal-detail', 1)}>
  View Goal
</button>
```

### Available Views
```javascript
// Employee
'my-goals', 'goal-detail', 'my-reviews', 'review-detail', 
'self-assessment', 'feedback'

// Manager
'team-goals', 'goal-approval', 'verify-evidence', 'team-members'

// Admin
'users', 'review-cycles', 'audit-logs', 'analytics'

// Shared
'dashboard', 'notifications'
```

---

## 📊 Data Patterns

### Mock Data Structure
```javascript
// Goal Object
const goal = {
  id: 1,
  title: 'API Optimization',
  description: 'Optimize database queries...',
  category: 'TECHNICAL', // TECHNICAL|BEHAVIORAL|PROCESS|DEVELOPMENT
  priority: 'High',      // Low|Medium|High
  status: 'IN_PROGRESS', // PENDING|APPROVED|IN_PROGRESS|COMPLETED|CHANGES_REQUESTED
  startDate: '2026-01-10',
  endDate: '2026-03-15',
  progress: 65,          // 0-100
  employee: 'John Employee',
  manager: 'Jane Manager',
};

// Review Object
const review = {
  id: 1,
  cycle: 'Q1 2026',
  status: 'SELF_ASSESSMENT_PENDING', // ...|COMPLETED|COMPLETED_AND_ACKNOWLEDGED
  selfAssessment: 'During Q1...',
  selfRating: 4,                      // 1-5
  managerFeedback: 'John demonstrated...',
  managerRating: 4,
  acknowledged: false,
};

// Notification Object
const notification = {
  id: 1,
  message: 'Manager approved your goal...',
  time: '2 hours ago',
  unread: true,
  type: 'success', // success|info|warning
};
```

---

## 🎯 Common Patterns

### 1. Modal Pattern
```jsx
const [showModal, setShowModal] = useState(false);

// Trigger button
<button onClick={() => setShowModal(true)}>
  Open Modal
</button>

// Modal component
{showModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
      <div className="p-6 border-b border-gray-200">
        <h3>Modal Title</h3>
      </div>
      <div className="p-6">
        {/* Content */}
      </div>
      <div className="p-6 border-t border-gray-200">
        <button onClick={() => setShowModal(false)}>Cancel</button>
        <button onClick={handleSubmit}>Submit</button>
      </div>
    </div>
  </div>
)}
```

### 2. Table Pattern
```jsx
<div className="bg-white rounded-lg shadow-sm border border-gray-200">
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Column
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {items.map((item, index) => (
          <tr key={item.id} className={`hover:bg-gray-50 ${index % 2 === 1 ? 'bg-gray-50/50' : ''}`}>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              {item.name}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

### 3. Filter Pattern
```jsx
const [searchTerm, setSearchTerm] = useState('');
const [statusFilter, setStatusFilter] = useState('ALL');

const filteredItems = items.filter(item => {
  const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
  return matchesSearch && matchesStatus;
});
```

### 4. Form Pattern
```jsx
const [formData, setFormData] = useState({
  title: '',
  description: '',
  priority: 'Medium',
});

<input
  type="text"
  value={formData.title}
  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
/>
```

---

## 🔌 API Integration (Ready for Backend)

### API Base Configuration
```javascript
// config/api.ts
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

export const apiClient = {
  async get(endpoint: string, token: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },
  
  async post(endpoint: string, data: any, token: string) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  // ... put, delete methods
};
```

### Example Integration: Login
```javascript
// components/auth/Login.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });

    if (response.status === 'success') {
      localStorage.setItem('token', response.data.token);
      onLogin(response.data.user);
    } else {
      setError(response.msg || 'Login failed');
    }
  } catch (err) {
    setError('Network error. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### Example Integration: Get Goals
```javascript
// components/employee/GoalsList.tsx
useEffect(() => {
  const fetchGoals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await apiClient.get('/goals', token);
      
      if (response.status === 'success') {
        setGoals(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  };

  fetchGoals();
}, []);
```

---

## 🧪 Testing Guide

### Component Testing (Jest + React Testing Library)
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { GoalsList } from './GoalsList';

test('filters goals by search term', () => {
  const mockUser = { id: 1, name: 'Test User', role: 'EMPLOYEE' };
  const mockOnNavigate = jest.fn();
  
  render(<GoalsList user={mockUser} onNavigate={mockOnNavigate} />);
  
  const searchInput = screen.getByPlaceholderText('Search goals...');
  fireEvent.change(searchInput, { target: { value: 'API' } });
  
  expect(screen.getByText('API Optimization')).toBeInTheDocument();
  expect(screen.queryByText('Security Training')).not.toBeInTheDocument();
});
```

### E2E Testing (Cypress)
```javascript
describe('Goal Management Flow', () => {
  it('Employee can create and view goal', () => {
    cy.visit('/');
    cy.get('[data-testid="demo-login-employee"]').click();
    cy.contains('My Goals').click();
    cy.contains('Create New Goal').click();
    cy.get('input[name="title"]').type('Test Goal');
    cy.get('textarea[name="description"]').type('Test description');
    cy.contains('Create Goal').click();
    cy.contains('Test Goal').should('be.visible');
  });
});
```

---

## 🐛 Debugging Tips

### Common Issues & Solutions

#### 1. Component Not Rendering
```javascript
// Check if view is registered in App.tsx
{currentView === 'my-view' && <MyComponent />}

// Check if navigation is correct
onNavigate('my-view'); // not onNavigate('myView')
```

#### 2. State Not Updating
```javascript
// ❌ Wrong
const updateItem = (id) => {
  items[id].name = 'New Name'; // Direct mutation
};

// ✅ Correct
const updateItem = (id) => {
  setItems(prev => prev.map(item => 
    item.id === id ? { ...item, name: 'New Name' } : item
  ));
};
```

#### 3. Modal Not Closing
```javascript
// Make sure to prevent event bubbling
<button onClick={(e) => {
  e.stopPropagation();
  setShowModal(false);
}}>
  Close
</button>
```

---

## 📝 Code Conventions

### Naming
- **Components:** PascalCase (`GoalsList.tsx`)
- **Functions:** camelCase (`handleSubmit`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`)
- **CSS Classes:** kebab-case (Tailwind handles this)

### File Organization
```
ComponentName.tsx
├── Imports
├── Interface definitions
├── Component function
│   ├── State declarations
│   ├── Helper functions
│   ├── useEffect hooks
│   └── Return JSX
└── Export
```

### Comments
```javascript
// Use single-line comments for brief explanations
/*
  Use multi-line comments for complex logic explanations
  or TODO items that span multiple lines
*/

// API Integration: POST /api/v1/goals
// Expected response: { status: 'success', data: {...} }
```

---

## 🚀 Deployment Checklist

### Before Deployment
- [ ] Remove all console.log statements
- [ ] Add error boundaries
- [ ] Implement proper loading states
- [ ] Add API error handling
- [ ] Set up environment variables
- [ ] Test all user flows
- [ ] Run production build test
- [ ] Check bundle size
- [ ] Verify mobile responsiveness
- [ ] Test with actual API endpoints

### Environment Variables
```env
REACT_APP_API_URL=https://api.performancetrack.com/v1
REACT_APP_ENV=production
REACT_APP_VERSION=1.1.0
```

---

## 📚 Resources

### Key Dependencies
- **React:** 18.x - UI library
- **Tailwind CSS:** v4 - Styling
- **Lucide React:** Icons library
- **TypeScript:** Type safety

### Documentation Links
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Lucide Icons](https://lucide.dev)

### Internal Docs
- `/ADDITIONAL_APIS_SUGGESTIONS.md` - 23 enhancement APIs
- `/FIXES_COMPLETED.md` - Bug fixes log
- Postman collection - 47 API endpoints

---

## 🤝 Contributing

### Pull Request Process
1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes and test thoroughly
3. Run linter: `npm run lint`
4. Commit: `git commit -m "Add new feature"`
5. Push: `git push origin feature/new-feature`
6. Create PR with description

### Code Review Checklist
- [ ] Follows existing patterns
- [ ] Includes prop types/interfaces
- [ ] No console.logs
- [ ] Responsive on mobile
- [ ] Accessible (keyboard navigation, ARIA)
- [ ] No TypeScript errors

---

**Last Updated:** January 22, 2026  
**Version:** 1.1.0  
**Maintainer:** Development Team  

Happy Coding! 🎉
