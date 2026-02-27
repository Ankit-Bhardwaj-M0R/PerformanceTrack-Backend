# JavaScript → TypeScript Migration Guide

A comprehensive step-by-step guide to converting a React + Vite JavaScript project to TypeScript, based on the PerformanceTrack frontend migration.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Install TypeScript Dependencies](#2-install-typescript-dependencies)
3. [Create tsconfig.json](#3-create-tsconfigjson)
4. [Create tsconfig.node.json](#4-create-tsconfignodejson)
5. [Update vite.config.js → vite.config.ts](#5-update-viteconfigjs--viteconfigts)
6. [Rename Files](#6-rename-files)
7. [Create a Master Types File](#7-create-a-master-types-file)
8. [Typing useState](#8-typing-usestate)
9. [Typing Event Handlers](#9-typing-event-handlers)
10. [Typing Component Props](#10-typing-component-props)
11. [Typing Context](#11-typing-context)
12. [Typing API Services](#12-typing-api-services)
13. [Error Handling in catch Blocks](#13-error-handling-in-catch-blocks)
14. [Typing useRef and DOM Elements](#14-typing-useref-and-dom-elements)
15. [Enums vs Union Types](#15-enums-vs-union-types)
16. [Common Patterns in This Project](#16-common-patterns-in-this-project)
17. [Deriving Types from Java Backend](#17-deriving-types-from-java-backend)
18. [TypeScript Strict Mode Checklist](#18-typescript-strict-mode-checklist)
19. [Running and Building](#19-running-and-building)
20. [Common Errors and Fixes](#20-common-errors-and-fixes)

---

## 1. Prerequisites

- Node.js 18+ and npm
- Existing React + Vite project in JavaScript
- Basic TypeScript knowledge

---

## 2. Install TypeScript Dependencies

```bash
npm install --save-dev typescript @types/react @types/react-dom @types/node
```

**What each package does:**

| Package | Purpose |
|---|---|
| `typescript` | The TypeScript compiler |
| `@types/react` | Type definitions for React (JSX, hooks, events) |
| `@types/react-dom` | Type definitions for ReactDOM |
| `@types/node` | Type definitions for Node.js globals (e.g., `process.env`) |

> **Note:** Vite has built-in TypeScript support — no `ts-loader` or `babel-plugin-typescript` needed.

---

## 3. Create tsconfig.json

Create `tsconfig.json` at the project root:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Key settings explained:**

- `"jsx": "react-jsx"` — Use the new JSX transform (no need to `import React` in every file, but it is good practice)
- `"strict": true` — Enables all strict type-checking options
- `"moduleResolution": "bundler"` — Modern resolution, required for Vite
- `"noEmit": true` — TypeScript only checks types; Vite handles the actual compilation
- `"paths"` — Enables `@/components/Foo` style imports

---

## 4. Create tsconfig.node.json

Create `tsconfig.node.json` at the project root (for the Vite config file):

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

---

## 5. Update vite.config.js → vite.config.ts

Rename `vite.config.js` to `vite.config.ts` and add types:

**Before (JS):**
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': 'http://localhost:8091',
    },
  },
})
```

**After (TS):**
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:8091',
        changeOrigin: true,
      },
    },
  },
})
```

---

## 6. Rename Files

Rename all source files:

| Old Extension | New Extension | When to Use |
|---|---|---|
| `.jsx` | `.tsx` | Files with JSX/React components |
| `.js` (with JSX) | `.tsx` | Same as above |
| `.js` (no JSX) | `.ts` | Pure logic: services, utils, types |
| `.js` (config files) | `.js` or `.ts` | Config files can stay as `.js` |

**Quick rename using PowerShell:**
```powershell
# Rename all .jsx → .tsx
Get-ChildItem -Path .\src -Filter "*.jsx" -Recurse |
  Rename-Item -NewName { $_.Name -replace '\.jsx$', '.tsx' }

# Rename all .js → .ts (in services, utils)
Get-ChildItem -Path .\src\services -Filter "*.js" |
  Rename-Item -NewName { $_.Name -replace '\.js$', '.ts' }
```

---

## 7. Create a Master Types File

Create `src/types/index.ts` with all your interfaces, types, and enums. This is the single source of truth.

### 7.1 Defining Enums

Mirror your Java enums directly:

```typescript
// Java: public enum UserRole { ADMIN, MANAGER, EMPLOYEE }
export enum UserRole {
  ADMIN    = 'ADMIN',
  MANAGER  = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

// Java: public enum GoalStatus { PENDING, APPROVED, IN_PROGRESS, ... }
export enum GoalStatus {
  PENDING                     = 'PENDING',
  APPROVED                    = 'APPROVED',
  IN_PROGRESS                 = 'IN_PROGRESS',
  COMPLETED                   = 'COMPLETED',
  REJECTED                    = 'REJECTED',
  CHANGES_REQUESTED           = 'CHANGES_REQUESTED',
  PENDING_COMPLETION_APPROVAL = 'PENDING_COMPLETION_APPROVAL',
  EVIDENCE_REQUESTED          = 'EVIDENCE_REQUESTED',
  COMPLETION_REJECTED         = 'COMPLETION_REJECTED',
}
```

### 7.2 Defining Interfaces from Java DTOs

Mirror your Java DTO classes:

```typescript
// Java: public class GoalResponseDTO { private Long goalId; private String title; ... }
export interface GoalResponseDTO {
  goalId:          number
  userId?:         number
  employeeName?:   string
  title:           string
  description:     string
  category:        string
  priority:        string
  status:          string
  targetDate?:     string | null   // LocalDate → string (ISO format)
  completionDate?: string | null
  managerComments?: string | null
  evidenceUrl?:    string | null
  progress?:       number
}
```

**Java → TypeScript type mapping:**

| Java Type | TypeScript Type |
|---|---|
| `Long`, `Integer`, `int` | `number` |
| `String` | `string` |
| `Boolean`, `boolean` | `boolean` |
| `LocalDate`, `LocalDateTime` | `string \| null` (ISO date string from JSON) |
| `List<T>` | `T[]` |
| `Map<K, V>` | `Record<K, V>` |
| `Optional<T>` | `T \| null \| undefined` |
| Enum type | TypeScript enum or union string |

---

## 8. Typing useState

Always provide a type parameter to `useState`:

```typescript
// Primitive types (TypeScript can infer these)
const [loading, setLoading] = useState(false)          // inferred: boolean
const [name, setName]       = useState('')             // inferred: string
const [count, setCount]     = useState(0)              // inferred: number

// Complex types MUST be explicit
const [user, setUser]       = useState<UserDTO | null>(null)
const [goals, setGoals]     = useState<GoalResponseDTO[]>([])
const [userMap, setUserMap] = useState<Record<number, UserDTO>>({})
const [form, setForm]       = useState<GoalFormState>({
  title: '', description: '', category: '', priority: '', targetDate: ''
})
```

---

## 9. Typing Event Handlers

```typescript
// Form submit
const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
  e.preventDefault()
  // ...
}

// Input change
const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
  setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
}

// Select change
const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>): void => {
  setFilter(e.target.value)
}

// Textarea change
const handleTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
  setComment(e.target.value)
}

// Button click
const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
  e.preventDefault()
  // ...
}

// Input change for multiple field types (input, select, textarea)
const handleAnyChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
): void => {
  const { name, value } = e.target
  setForm(prev => ({ ...prev, [name]: value }))
}
```

---

## 10. Typing Component Props

Always define a props interface above the component:

```typescript
// Simple props
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean      // Optional with ?
  variant?: 'primary' | 'secondary' | 'danger'
}

function Button({ label, onClick, disabled = false, variant = 'primary' }: ButtonProps): JSX.Element {
  return <button onClick={onClick} disabled={disabled}>{label}</button>
}

// Props with children
interface CardProps {
  title: string
  children: React.ReactNode
  className?: string
}

// Props with a dynamic icon (Lucide React)
import type { ElementType } from 'react'

interface MetricCardProps {
  icon: ElementType
  value: number
  label: string
}

function MetricCard({ icon: Icon, value, label }: MetricCardProps): JSX.Element {
  return (
    <div>
      <Icon size={24} />
      <span>{value}</span>
      <span>{label}</span>
    </div>
  )
}

// Props with complex data
interface GoalCardProps {
  goal: GoalResponseDTO
  onEdit: (goal: GoalResponseDTO) => void
  onDelete: (goalId: number) => void
}
```

---

## 11. Typing Context

```typescript
// 1. Define the context value shape
interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: () => boolean
  isManager: () => boolean
  isEmployee: () => boolean
  isAuthenticated: boolean
}

// 2. Create context with a default value (can be undefined with proper check)
const AuthContext = React.createContext<AuthContextValue | undefined>(undefined)

// 3. Create a hook that validates the context exists
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

// 4. Provide the context
export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null)
  // ...
  const value: AuthContextValue = { user, token, login, logout, isAdmin, isManager, isEmployee, isAuthenticated }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
```

---

## 12. Typing API Services

Use Axios with generic types:

```typescript
import axios, { AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

// Type the response envelope from your backend
interface ApiResponse<T> {
  status: string
  msg:    string
  data:   T
}

// Create typed axios instance
const api: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Typed request interceptor
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token')
  if (token && config.headers) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Typed response interceptor (unwrap data envelope)
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => {
    if (response.data && response.data.data !== undefined) {
      response.data = response.data.data as typeof response.data
    }
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Typed service functions
const goalService = {
  getGoals: async (page = 0, size = 10): Promise<GoalResponseDTO[]> => {
    const response = await api.get<GoalResponseDTO[]>(`/goals?page=${page}&size=${size}`)
    return response.data
  },
  createGoal: async (data: CreateGoalRequest): Promise<GoalResponseDTO> => {
    const response = await api.post<GoalResponseDTO>('/goals', data)
    return response.data
  },
}
```

---

## 13. Error Handling in catch Blocks

TypeScript `strict` mode types catch variables as `unknown`:

```typescript
// ❌ JS pattern (does not work in strict TS)
try {
  await api.post('/goals', data)
} catch (err) {
  toast.error(err.response.data.msg)  // Error: Object is of type 'unknown'
}

// ✅ TS pattern — cast the error
try {
  await api.post('/goals', data)
} catch (err: unknown) {
  const e = err as { response?: { data?: { msg?: string } } }
  toast.error(e.response?.data?.msg ?? 'Something went wrong')
}

// ✅ Alternative — instanceof check
try {
  await api.post('/goals', data)
} catch (err) {
  if (axios.isAxiosError(err)) {
    toast.error(err.response?.data?.msg ?? 'Request failed')
  } else {
    toast.error('An unexpected error occurred')
  }
}
```

---

## 14. Typing useRef and DOM Elements

```typescript
// Input ref
const inputRef = useRef<HTMLInputElement>(null)

// Access current safely
useEffect(() => {
  inputRef.current?.focus()
}, [])

// Button ref
const btnRef = useRef<HTMLButtonElement>(null)

// Generic container ref
const containerRef = useRef<HTMLDivElement>(null)
```

---

## 15. Enums vs Union Types

Both are valid TypeScript. Choose based on your use case:

```typescript
// Enum — good when mirroring Java enums, enables iteration
export enum GoalStatus {
  PENDING   = 'PENDING',
  APPROVED  = 'APPROVED',
  COMPLETED = 'COMPLETED',
}

// Usage
const status: GoalStatus = GoalStatus.APPROVED

// Union type — lighter, good for action types or small sets
export type ManagerActionType =
  | 'APPROVE'
  | 'REQUEST_CHANGES'
  | 'APPROVE_COMPLETION'
  | 'REJECT_COMPLETION'
  | 'REQUEST_EVIDENCE'

// Usage
const action: ManagerActionType = 'APPROVE'

// ✅ Tip: Use enums for backend-mirrored values, union types for UI-only flags
```

---

## 16. Common Patterns in This Project

### 16.1 Paginated vs Non-Paginated API Responses

Some endpoints return a plain array, others return a Spring Page object:

```typescript
// The backend sometimes returns: T[]
// And sometimes returns: { content: T[], totalElements: number, ... }

// Universal pattern to handle both:
const raw = response.data as T[] | { content?: T[] }
const list: T[] = Array.isArray(raw) ? raw : (raw as { content?: T[] }).content ?? []
```

### 16.2 Record Types for Maps

```typescript
// Map of userId → UserDTO
const [userMap, setUserMap] = useState<Record<number, UserDTO>>({})

// Build the map from an array
const newMap: Record<number, UserDTO> = {}
users.forEach(u => { if (u.userId != null) newMap[u.userId] = u })
setUserMap(newMap)

// Look up safely
const user = userMap[goal.userId] // UserDTO | undefined
const name = userMap[goal.userId]?.name ?? 'Unknown'
```

### 16.3 Promise.allSettled with Types

```typescript
const [aRes, bRes] = await Promise.allSettled([
  serviceA.getData(),
  serviceB.getData(),
])

if (aRes.status === 'fulfilled') {
  const data = aRes.value as MyType
  setDataA(data)
}
// Rejected results have .reason instead of .value
if (bRes.status === 'rejected') {
  console.error(bRes.reason)
}
```

### 16.4 Typed Derived State

```typescript
// Derive unique departments list from members array
const departments: string[] = [
  'ALL',
  ...[...new Set(members.map(m => m.department).filter((d): d is string => Boolean(d)))]
]
```

### 16.5 Optional Chaining and Nullish Coalescing

```typescript
// JS
const name = user && user.name ? user.name : 'Unknown'

// TS idiomatic
const name = user?.name ?? 'Unknown'

// Deep chains
const msg = err?.response?.data?.msg ?? 'Failed'
```

---

## 17. Deriving Types from Java Backend

### 17.1 Java Enum → TypeScript Enum

```java
// Java
public enum GoalPriority {
    HIGH, MEDIUM, LOW
}
```

```typescript
// TypeScript
export enum GoalPriority {
  HIGH   = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW    = 'LOW',
}
```

### 17.2 Java DTO → TypeScript Interface

```java
// Java
@Data
public class UserDTO {
    private Long userId;
    private String name;
    private String email;
    private UserRole role;
    private String department;
    private String position;
    private UserStatus status;
}
```

```typescript
// TypeScript
export interface UserDTO {
  userId?:     number
  name?:       string
  email?:      string
  role?:       UserRole | string
  department?: string
  position?:   string
  status?:     UserStatus | string
}
```

### 17.3 Java Validation Annotations → TypeScript Hints

```java
// Java — @NotBlank means required string
@NotBlank private String title;

// Java — @Size means add length validation in TS form validation
@Size(max = 100) private String title;

// Java — @Min/@Max
@Min(1) @Max(5) private Integer rating;
```

TypeScript interfaces do not enforce these constraints at compile time, but you can add comments or runtime validation:

```typescript
export interface CreateGoalRequest {
  title:       string     // @NotBlank — required
  description: string     // @NotBlank — required
  category:    string     // @NotNull
  priority:    string     // @NotNull
  targetDate?: string     // Optional ISO date string
}
```

---

## 18. TypeScript Strict Mode Checklist

When `"strict": true` is set, you must handle:

| Issue | Fix |
|---|---|
| `Object is possibly null` | Use `?.` optional chaining or null checks |
| `Object is possibly undefined` | Add `?? defaultValue` or type guard |
| `Type 'unknown'` in catch | Cast with `as { ... }` or use `instanceof` |
| `Type 'string \| undefined' not assignable to 'string'` | Use `?? ''` to provide default |
| `JSX element implicitly has type 'any'` | Install `@types/react` |
| `Cannot find name 'process'` | Install `@types/node` |
| Parameter implicitly has an 'any' type | Add explicit type annotation |

---

## 19. Running and Building

```bash
# Install dependencies
npm install

# Type-check only (no build)
npx tsc --noEmit

# Start dev server (Vite handles TS compilation)
npm run dev

# Build for production (type-check + compile)
npm run build
```

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "dev":       "vite",
    "build":     "tsc && vite build",
    "preview":   "vite preview",
    "type-check": "tsc --noEmit"
  }
}
```

> **Note:** `"build": "tsc && vite build"` runs the TypeScript type-checker first, then Vite builds. This ensures you catch all type errors before deploying.

---

## 20. Common Errors and Fixes

### Error: `Cannot find module '@/components/...' or its corresponding type declarations`

**Fix:** Add path aliases to both `tsconfig.json` and `vite.config.ts`:

```json
// tsconfig.json
"paths": { "@/*": ["src/*"] }
```

```ts
// vite.config.ts
import path from 'path'
resolve: { alias: { '@': path.resolve(__dirname, './src') } }
```

---

### Error: `Property 'X' does not exist on type 'never'`

Happens when TypeScript narrows a type to `never` (empty array or impossible intersection).

```typescript
// ❌ TypeScript infers never[] for empty array
const [items, setItems] = useState([])

// ✅ Provide explicit type
const [items, setItems] = useState<GoalResponseDTO[]>([])
```

---

### Error: `Type '{ children: ReactNode }' is not assignable to type 'IntrinsicAttributes'`

The component does not declare `children` in its props.

```typescript
// ❌
function Wrapper() { return <div>{children}</div> }  // children not in props

// ✅
function Wrapper({ children }: { children: React.ReactNode }): JSX.Element {
  return <div>{children}</div>
}
```

---

### Error: `Argument of type 'string | null' is not assignable to parameter of type 'string'`

```typescript
// ❌
const id = localStorage.getItem('userId')  // string | null
setUserId(id)  // Error if setUserId expects string

// ✅ Option 1 — non-null assertion (use when you know it exists)
setUserId(id!)

// ✅ Option 2 — null check
if (id) setUserId(id)

// ✅ Option 3 — fallback
setUserId(id ?? '')
```

---

### Error: `JSX element type 'X' does not have any construct or call signatures`

Happens with dynamically typed icon/component props.

```typescript
// ❌
interface Props { icon: object }

// ✅ Use ElementType from react
import type { ElementType } from 'react'
interface Props { icon: ElementType }
function Comp({ icon: Icon }: Props) { return <Icon /> }
```

---

### Error: `'React' refers to a UMD global, but the current file is a module`

Add `import React from 'react'` at the top of the file, or ensure `"jsx": "react-jsx"` is in tsconfig (which removes the need for explicit React imports).

---

## Summary

The key differences between the JS and TS versions of this project:

1. **All state variables** have explicit generic types: `useState<Type>()`
2. **All component props** have interface definitions above each component
3. **All catch blocks** use `(err: unknown)` with type cast pattern
4. **All event handlers** have typed event parameter (e.g., `React.ChangeEvent<HTMLInputElement>`)
5. **A central `src/types/index.ts`** file contains all interfaces/enums derived from the Java backend
6. **Enums** replace magic string literals throughout the codebase
7. **Optional chaining (`?.`) and nullish coalescing (`??`)** replace verbose null checks
8. **`document.getElementById('root')!`** uses non-null assertion in `main.tsx`
9. **`import type`** is used for type-only imports for cleaner tree-shaking
10. **`"strict": true`** in tsconfig catches all potential null/undefined issues at compile time
