# Into The Wild - Technical Architecture Guide

## 📋 Table of Contents

1. [Project Structure](#1-project-structure)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Backend & Database Architecture](#3-backend--database-architecture)
4. [Database Management System](#4-database-management-system)
5. [Development Standards & Quality](#5-development-standards--quality)
6. [Performance & Optimization](#6-performance--optimization)
7. [Security & Database](#7-security--database)
8. [Testing & Quality Assurance](#8-testing--quality-assurance)

---

## 1. Project Structure

### 1.1 Directory Structure Overview

The codebase follows a clear separation of concerns with organized directory structure:

```
into-the-wild/
├── src/                    # Frontend React application
│   ├── components/         # Reusable UI components
│   │   ├── admin/          # Admin-specific components
│   │   ├── auth/           # Authentication components
│   │   ├── trek/           # Trek-related components
│   │   ├── profile/        # User profile components
│   │   ├── expenses/       # Expense management components
│   │   └── ui/             # Base UI components (shadcn/ui)
│   ├── pages/              # Route components (pages)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and configurations
│   ├── services/           # API services and business logic
│   ├── types/              # TypeScript type definitions
│   ├── integrations/       # Third-party integrations (Supabase)
│   ├── utils/              # General utility functions
│   └── styles/             # Global styles and themes
├── supabase/               # Backend and database
│   ├── migrations/         # Database migrations (SQL)
│   ├── functions/          # Edge Functions (Deno)
│   ├── seed.sql           # Database seeding data
│   └── config.toml        # Supabase configuration
├── docs/                   # Documentation (consolidated)
├── scripts/                # Quality automation scripts
├── public/                 # Static assets
├── backend/               # Legacy backend (if needed)
├── archive/               # Archived files and old documentation
└── prereq/                # Context and reference materials (read-only)
```

### 1.2 Frontend Architecture

#### Component Organization
The frontend follows a feature-based architecture with clear separation:

```
src/
├── components/            # Reusable UI components
│   ├── ui/               # Base components (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── table.tsx
│   │   └── textarea.tsx
│   ├── admin/            # Admin-specific components
│   ├── auth/             # Authentication components
│   ├── trek/             # Trek management components
│   ├── profile/          # User profile components
│   └── expenses/         # Expense management components
├── pages/                # Route components (page-level)
│   ├── Index.tsx        # Landing page
│   ├── Auth.tsx         # Authentication page
│   ├── Dashboard.tsx    # User dashboard
│   ├── TrekEvents.tsx   # Events listing
│   ├── PublicGallery.tsx # Gallery page
│   └── admin/           # Admin pages
├── hooks/                # Custom React hooks
│   ├── useAuth.ts       # Authentication hook
│   ├── useTreks.ts      # Trek data management
│   ├── useNotifications.ts # Notification management
│   └── useTrekRegistration.ts # Registration workflow
├── lib/                  # Utilities and configurations
│   ├── utils.ts         # General utilities (cn function)
│   ├── supabase.ts      # Supabase client configuration
│   └── errorHandling.ts # Error handling utilities
├── services/             # API services and business logic
├── types/                # TypeScript type definitions
└── integrations/         # Third-party service integrations
```

#### Key Architecture Principles

1. **Component-Based Architecture**: Each feature is self-contained
2. **Separation of Concerns**: UI, business logic, and data access separated
3. **Type Safety**: Comprehensive TypeScript usage with strict patterns
4. **Performance First**: Lazy loading, code splitting, and optimization
5. **Accessibility**: WCAG 2.1 AA compliance throughout

---

## 2. Frontend Architecture

### 2.1 React Architecture Patterns

#### State Management Strategy
```typescript
// Global state management with TanStack Query
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Server state (API data)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000,   // 10 minutes
    },
  },
});

// Local state (UI state)
const [isLoading, setIsLoading] = useState(false);
const [filters, setFilters] = useState(defaultFilters);
```

#### Component Patterns
```typescript
// Compound component pattern for complex UIs
interface TabsProps {
  defaultValue?: string;
  children: React.ReactNode;
}

const Tabs: React.FC<TabsProps> & {
  List: typeof TabsList;
  Trigger: typeof TabsTrigger;
  Content: typeof TabsContent;
} = ({ children, defaultValue }) => {
  // Implementation
};

// Usage
<Tabs defaultValue="overview">
  <Tabs.List>
    <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
    <Tabs.Trigger value="participants">Participants</Tabs.Trigger>
  </Tabs.List>
  <Tabs.Content value="overview">Overview content</Tabs.Content>
  <Tabs.Content value="participants">Participants content</Tabs.Content>
</Tabs>
```

### 2.2 React Hooks Guidelines

#### Core Principles
1. **Prevent Infinite Loops**: Avoid dependency cycles between `useEffect` and `useCallback`
2. **Performance First**: Memoize expensive operations but avoid unnecessary dependencies
3. **Predictable Behavior**: Ensure consistent behavior across renders

#### Correct Patterns

**Pattern 1: Empty Dependencies with Stale Closure (Recommended)**
```typescript
const fetchData = useCallback(async (param: string) => {
  // ✅ Read current state inside function (stale closure)
  const currentFilter = filterState;
  const currentSort = sortBy;

  // Make API call using current values
  const result = await api.get(`/data?filter=${currentFilter}&sort=${currentSort}`);
  setData(result);
}, []); // ✅ Empty dependencies

useEffect(() => {
  fetchData('initial');
}, [fetchData]);
```

**Pattern 2: Primitive Dependencies Only**
```typescript
const [searchTerm, setSearchTerm] = useState('');
const [sortBy, setSortBy] = useState('date');

const fetchData = useCallback(async () => {
  await api.get(`/data?search=${searchTerm}&sort=${sortBy}`);
}, [searchTerm, sortBy]); // ✅ Only primitive values

useEffect(() => {
  fetchData();
}, [searchTerm, sortBy]);
```

**Pattern 3: Object Length Instead of Object Reference**
```typescript
const [selectedTags, setSelectedTags] = useState<number[]>([]);

useEffect(() => {
  fetchData();
}, [selectedTags.length]); // ✅ Use .length instead of array reference

// ❌ DON'T DO THIS:
// useEffect(() => { fetchData(); }, [selectedTags]);
```

#### Anti-Patterns (Never Use)

**Anti-Pattern 1: Function in Dependencies**
```typescript
// ❌ NEVER DO THIS - Creates infinite loops
const fetchData = useCallback(async () => {
  // ... fetch logic
}, [someState]);

useEffect(() => {
  fetchData(); // This calls the function
}, [fetchData]); // ❌ Function reference in dependencies
```

**Anti-Pattern 2: Complex Dependencies**
```typescript
// ❌ AVOID - Creates unnecessary re-renders
const fetchData = useCallback(async () => {
  await api.get(`/data?filter=${JSON.stringify(filters)}&sort=${sort}`);
}, [filters, sort]); // ❌ Objects in dependencies

// ✅ BETTER
const fetchData = useCallback(async () => {
  await api.get(`/data?filter=${filters.category}&sort=${sort}`);
}, [filters.category, sort]); // ✅ Only primitive values
```

### 2.3 TypeScript Configuration

#### Project Configuration
```json
// tsconfig.json - Root configuration
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "composite": true,
    "jsx": "react",
    "strict": false,  // Note: Currently relaxed for development speed
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "incremental": true,
    "typeRoots": ["./node_modules/@types"]
  },
  "include": ["src", "next-env.d.ts"],
  "exclude": ["node_modules", "dist", "**/*.d.ts"]
}
```

#### Strict Type Checking
For production builds and quality gates:
```bash
# Run strict TypeScript checking
npm run type-check:strict

# This enables:
# - noImplicitAny: true
# - strictNullChecks: true
# - noImplicitReturns: true
# - exactOptionalPropertyTypes: true
```

### 2.4 Code Quality Standards

#### ESLint Configuration
```javascript
// eslint.config.js - Enhanced rules
export default [
  {
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    plugins: {
      import: importPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
    },
    rules: {
      // Import organization
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
        },
      ],

      // React hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // General code quality
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",

      // TypeScript specific
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
    },
  },
];
```

#### Pre-commit Hooks
```bash
# Pre-commit quality gates
npm run precommit  # Runs: type-check + lint + test:run

# Individual quality checks
npm run type-check     # TypeScript validation
npm run lint          # ESLint code quality
npm run test:run      # Test suite execution
npm run build         # Production build validation
```

---

## 3. Backend & Database Architecture

### 3.1 Supabase Architecture

#### Services Overview
- **Database**: PostgreSQL with advanced features
- **Authentication**: Built-in user management and JWT
- **Storage**: File uploads with RLS policies
- **Edge Functions**: Serverless functions (Deno runtime)
- **Real-time**: Live data synchronization
- **Row Level Security**: Comprehensive data access control

#### Database Schema Structure
```sql
-- Core user management
users (id, email, user_type, partner_id, verification_status)

-- Trek management
trek_events (trek_id, name, description, category, difficulty, dates, location, cost)
trek_registrations (registration_id, trek_id, user_id, status, payment_status)
trek_pickup_locations (pickup_id, trek_id, location, coordinates)

-- Community features
forum_categories (category_id, name, description, color)
forum_threads (thread_id, category_id, title, author_id)
forum_posts (post_id, thread_id, content, author_id)

-- Financial management
trek_expenses (expense_id, trek_id, amount, description, category)
expense_shares (share_id, expense_id, user_id, amount)

-- Communication
notifications (notification_id, user_id, type, message, status)
scheduled_notifications (schedule_id, notification_id, scheduled_for)
```

### 3.2 Database Migration Strategy

#### Migration Files Structure
```
supabase/migrations/
├── 20250505155501_squashed_schema.sql    # Complete schema
├── 20251026000000_notifications.sql      # Notification system
├── 20251026010000_forum_system.sql       # Forum features
├── 20251026020000_media_management.sql   # Image/tagging system
├── 20251026030000_id_verification.sql    # ID proof system
└── 20251226000000_rls_policy_fixes.sql   # Security updates
```

#### Creating New Migrations
```bash
# Method 1: Diff-based (recommended)
supabase db diff -f add_new_feature

# Method 2: Manual creation
supabase migration new add_new_feature

# Apply migrations locally
supabase db reset  # Complete reset with seeding
supabase db push   # Push specific migrations
```

#### Migration Best Practices
- **Conditional Logic**: Use `DO $$ BEGIN IF EXISTS ... END IF; $$`
- **Error Handling**: Proper rollback procedures
- **Testing**: Test migrations on development before production
- **Documentation**: Comment complex migration logic

### 3.3 Database Management System {#database-management-system}

#### Overview

The project implements a comprehensive **Database Schema Management System** that provides automated schema management, migration consolidation, health checks, and synchronization between local and remote databases. This system ensures reliable, secure, and performant database operations throughout the development lifecycle.

#### Architecture

##### Core Components

1. **DatabaseSchemaAgent** (`scripts/db-schema-agent.ts`) - Main automation agent
2. **Consolidated Migration** (`supabase/migrations/20260101000000_comprehensive_schema_consolidation.sql`) - Single source of truth
3. **Schema Extraction** (`scripts/extract_latest_schema.js`) - Current state capture
4. **Validation System** - Comprehensive health checks

##### Key Features

- ✅ **Automatic Migration Management** - Detects and applies pending migrations
- ✅ **Conflict Resolution** - Automatically resolves local/remote disparities
- ✅ **Schema Validation** - Comprehensive RLS and integrity checks
- ✅ **Backup & Recovery** - Automated backup before major operations
- ✅ **Health Monitoring** - Real-time database health assessment
- ✅ **Consolidation** - Converts complex migration history into clean schema

#### Quick Start

##### Initial Setup

```bash
# Start local Supabase instance
npm run supabase:start

# Run full database setup (consolidates and syncs everything)
npm run db:full-setup

# Validate the setup
npm run db:validate
```

##### Development Workflow

```bash
# Check database health
npm run db:health

# Sync with remote (if needed)
npm run db:sync

# Extract current schema for documentation
npm run db:extract-schema
```

##### Production Deployment

```bash
# Create backup before deployment
npm run db:backup

# Sync local and remote databases
npm run db:prod-sync

# Validate production readiness
npm run db:validate
```

#### Available Commands

##### Database Management Agents

| Command | Description | Usage |
|---------|-------------|-------|
| `npm run db:sync` | Synchronize local and remote databases | Full sync including conflict resolution |
| `npm run db:validate` | Validate schema health and RLS policies | Health check with detailed reporting |
| `npm run db:consolidate` | Consolidate migrations into clean schema | Creates single consolidated migration |
| `npm run db:backup` | Create timestamped database backup | Backup current state |
| `npm run db:health` | Run comprehensive health checks | Quick health assessment |

##### Complete Workflows

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run db:dev` | Start development with validation | Daily development |
| `npm run db:dev:reset` | Reset and sync development | After major changes |
| `npm run db:prod-sync` | Production synchronization | Before deployment |
| `npm run db:full-setup` | Complete setup from scratch | Initial setup or recovery |

#### Database Schema

##### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `users` | User profiles and authentication | Extended profile fields, RLS policies |
| `trek_events` | Trek event definitions | Complete lifecycle management |
| `trek_registrations` | User registrations for treks | Multi-step registration process |
| `trek_expenses` | Expense tracking | Fair sharing system |
| `notifications` | User notifications | Real-time and scheduled |
| `forum_*` | Community forum system | Categories, threads, posts, voting |

##### Security Features

- **Row Level Security (RLS)** enabled on all tables
- **Admin-only access** for sensitive operations
- **User isolation** - users only see their own data
- **Secure functions** with proper permissions

##### Performance Features

- **Strategic indexes** on all foreign keys and search columns
- **Optimized queries** for common operations
- **Connection pooling** configuration
- **Efficient RLS policies**

#### Migration Strategy

##### Consolidation Process

1. **Archive Old Migrations** - Move conflicting migrations to archive
2. **Extract Current State** - Get actual database schema
3. **Create Consolidated Migration** - Single migration with all fixes
4. **Validate and Test** - Ensure everything works correctly
5. **Deploy** - Apply to production with confidence

##### Conflict Resolution

The system automatically detects and resolves:
- **Local/Remote Drift** - Synchronizes migration status
- **Policy Conflicts** - Removes duplicate RLS policies
- **Schema Inconsistencies** - Standardizes table structures
- **Permission Issues** - Fixes access control problems

#### Health Checks

The validation system checks:

##### Schema Integrity
- All tables have RLS enabled
- Required indexes exist
- Foreign key constraints valid
- Data types consistent

##### Security Validation
- RLS policies working correctly
- Admin functions accessible
- User permissions appropriate
- Storage policies configured

##### Performance Metrics
- Query performance acceptable
- Indexes properly utilized
- Connection limits not exceeded
- Functions executing efficiently

#### Troubleshooting

##### Common Issues

###### Database Connection Issues
```bash
# Check Supabase status
npm run supabase:status

# Restart if needed
npm run supabase:stop && npm run supabase:start
```

###### Migration Conflicts
```bash
# Consolidate and start fresh
npm run db:consolidate
npm run db:dev:reset
```

###### RLS Policy Errors
```bash
# Validate and fix policies
npm run db:validate
npm run db:sync
```

###### Schema Drift
```bash
# Sync with remote
npm run db:sync
npm run db:extract-schema
```

##### Recovery Procedures

###### Emergency Reset
```bash
# Complete reset and rebuild
npm run supabase:stop
npm run supabase:start
npm run db:full-setup
```

###### Production Recovery
```bash
# Backup, sync, validate
npm run db:backup
npm run db:prod-sync
npm run db:validate
```

#### Monitoring

##### Logs and Reports

- **Migration logs** stored in `database-schema/backups/`
- **Health reports** generated by validation commands
- **Schema extracts** in `database-schema/latest_schema.sql`
- **Backup files** timestamped and archived

##### Performance Monitoring

- **Query performance** tracked in function execution
- **Connection usage** monitored via Supabase dashboard
- **Storage utilization** tracked for file uploads
- **RLS policy efficiency** validated automatically

#### Best Practices

##### Development
1. **Always validate** after schema changes
2. **Create backups** before major operations
3. **Test locally** before deploying to remote
4. **Use consolidated migrations** for complex changes

##### Deployment
1. **Validate production** before deployment
2. **Create backups** of production data
3. **Test deployment** in staging first
4. **Monitor** after deployment completion

##### Maintenance
1. **Regular health checks** with `npm run db:health`
2. **Schema extraction** after major changes
3. **Migration consolidation** when conflicts arise
4. **Backup verification** for critical data

#### Integration with CI/CD

The system integrates with deployment pipelines:

```yaml
# Example GitHub Actions
- name: Database Health Check
  run: npm run db:health

- name: Schema Validation
  run: npm run db:validate

- name: Production Sync
  run: npm run db:prod-sync
```

### 3.4 Edge Functions Architecture

#### Function Structure
```
supabase/functions/
├── signup-automation/          # User onboarding automation
│   ├── index.ts               # Main function
│   └── utils.ts               # Helper functions
└── import_map.json            # Dependency management
```

#### Function Development
```typescript
// supabase/functions/signup-automation/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  // Function logic here
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

---

## 5. Development Standards & Quality

### 5.1 Code Quality Agents System

#### Overview
The project implements a comprehensive automated code quality system with 8 specialized agents:

| Agent | Purpose | Implementation |
|-------|---------|----------------|
| **Code Refactoring Agent** | Automatic code improvements | `scripts/refactor.ps1` |
| **Bug Detection Agent** | Issue identification | `scripts/bug-detector.ps1` |
| **Auto-Fix Agent** | Intelligent fixes | `scripts/auto-fix.ts` |
| **Code Cleanup Agent** | Remove unused code | `scripts/cleanup.ts` |
| **Architecture Improvement Agent** | Structure optimization | `scripts/architecture-optimize.ts` |
| **Code Beautification Agent** | Format and style | `scripts/beautify.ts` |
| **Deployment Validation Agent** | Production readiness | `scripts/deploy-validate.ts` |
| **📚 Documentation Agent** | Documentation workflow | `scripts/docs-agent.ts` |

#### Quality Gates
```bash
# Pre-commit quality checks (includes documentation validation)
npm run precommit          # TypeScript + ESLint + Tests + Documentation

# Enhanced quality analysis (includes full documentation workflow)
npm run quality-check:strict  # Strict mode + enhanced tests + documentation workflow

# Complete project analysis (all 8 agents)
npm run full-analysis      # Refactor + Bug detect + Auto-fix + Documentation

# Documentation-specific commands
npm run docs:validate      # Validate master documents
npm run docs:consolidate   # Find and consolidate temporary docs
npm run docs:archive       # Archive old temporary docs
npm run docs:quality       # Check documentation quality
npm run docs:pre-deploy    # Pre-deployment documentation check
npm run docs:full-check    # Run all documentation checks

# Individual agent runs
npm run refactor           # Code improvements
npm run bug-detect         # Issue detection
npm run auto-fix           # Intelligent fixes
```

### 5.2 Indian Market Compliance

#### Currency Formatting
```typescript
// src/utils/indianStandards.ts
export function formatCurrency(amount: number, currency: string = "INR"): string {
  // Format for Indian market: ₹1,23,456
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}
```

#### Date Formatting
```typescript
export function formatIndianDate(date: Date | string, includeTime: boolean = false): string {
  const dateObj = new Date(date);

  // DD/MM/YYYY format for Indian market
  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  if (includeTime) {
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  return `${day}/${month}/${year}`;
}
```

#### GST Calculations
```typescript
export function calculateGST(amount: number, gstRate: number = 18): {
  baseAmount: number;
  gstAmount: number;
  totalAmount: number;
} {
  const baseAmount = amount / (1 + gstRate / 100);
  const gstAmount = amount - baseAmount;
  const totalAmount = amount;

  return {
    baseAmount: Math.round(baseAmount),
    gstAmount: Math.round(gstAmount),
    totalAmount,
  };
}
```

### 5.3 Error Handling Patterns

#### Global Error Boundary
```typescript
// src/components/ErrorBoundary.tsx
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to monitoring service
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Report to error tracking service
    // errorTrackingService.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}
```

#### API Error Handling
```typescript
// src/lib/errorHandling.ts
export class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function handleAPIError(error: any): APIError {
  if (error.response) {
    // Server responded with error status
    return new APIError(
      error.response.data?.message || 'Server error',
      error.response.status,
      error
    );
  } else if (error.request) {
    // Network error
    return new APIError('Network error', 0, error);
  } else {
    // Other error
    return new APIError(error.message || 'Unknown error', 0, error);
  }
}
```

---

## 6. Performance & Optimization

### 6.1 Bundle Optimization

#### Code Splitting Strategy
```javascript
// vite.config.ts - Manual chunk configuration
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('lucide') || id.includes('radix')) {
              return 'vendor-ui';
            }
            return 'vendor';
          }

          // Feature chunks
          if (id.includes('/components/admin/')) return 'admin';
          if (id.includes('/components/trek/')) return 'trek';
          if (id.includes('/components/profile/')) return 'profile';
          if (id.includes('/pages/forum/')) return 'forum';
        },
      },
    },
  },
});
```

#### Bundle Size Achievements
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Main Bundle** | 1,230 KB | 349 KB | 71.6% reduction |
| **Total Chunks** | 1 | 33 | Better caching |
| **Initial Load** | ~1.2 MB | ~350 KB | 3.4x faster |

#### Chunk Distribution
| Chunk | Size (KB) | Description |
|-------|-----------|-------------|
| vendor-react | 349.58 | React core libraries |
| vendor | 289.01 | Other vendor dependencies |
| trek | 143.47 | Trek-related components |
| vendor-supabase | 124.77 | Supabase client |
| index | 58.93 | Main application code |
| admin | 54.10 | Admin components |

### 6.2 Lazy Loading Implementation

#### Route-Based Lazy Loading
```jsx
// App.tsx - All routes lazy loaded
import { Suspense, lazy } from "react";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TrekEvents = lazy(() => import("./pages/TrekEvents"));
const PublicGallery = lazy(() => import("./pages/PublicGallery"));

// Route configuration with Suspense
<Route path="/" element={
  <Suspense fallback={<LoadingSpinner fullScreen />}>
    <Index />
  </Suspense>
} />
```

#### Component Lazy Loading
```jsx
// Dynamic imports for heavy components
const HeavyComponent = lazy(() =>
  import("./components/HeavyComponent")
);

const [showHeavyComponent, setShowHeavyComponent] = useState(false);

// Only load when needed
{showHeavyComponent && (
  <Suspense fallback={<LoadingSpinner />}>
    <HeavyComponent />
  </Suspense>
)}
```

### 6.3 Loading State Management

#### Consistent Loading Experience
```jsx
// LoadingSpinner.tsx - Reusable loading component
export function LoadingSpinner({
  fullScreen = false,
  className,
  size = "md",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div className={cn(
      "flex items-center justify-center",
      fullScreen ? "h-screen w-full" : "h-full w-full min-h-[200px]",
      className
    )}>
      <div className="flex flex-col items-center gap-2">
        <div className={cn(
          "animate-spin rounded-full border-t-transparent border-primary",
          sizeClasses[size]
        )} />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
```

#### Progressive Loading Patterns
```jsx
// Image loading with blur placeholder
<Image
  src={trek.image_url}
  alt={trek.name}
  className="w-full h-48 object-cover rounded-lg"
  loading="lazy"
  placeholder="blur"
  blurDataURL={placeholderImage}
/>

// Data loading with skeleton
{isLoading ? (
  <TrekCardSkeleton />
) : (
  <TrekCard trek={trek} />
)}
```

### 6.4 Performance Metrics

#### Core Web Vitals Targets
| Metric | Target | Current Status |
|--------|--------|----------------|
| **First Contentful Paint** | < 1.5s | ✅ ~0.6s |
| **Largest Contentful Paint** | < 2.5s | ✅ ~1.2s |
| **Cumulative Layout Shift** | < 0.1 | ✅ < 0.05 |
| **First Input Delay** | < 100ms | ✅ ~50ms |

#### Performance Monitoring
```bash
# Lighthouse performance audit
npm run analyze:performance

# Bundle size analysis
npm run analyze:bundle

# Core Web Vitals tracking
# Integrated with Vercel Analytics
```

---

## 7. Security & Database

### 7.1 Row Level Security (RLS) Policies

#### User Data Access
```sql
-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);
```

#### Trek Registration Security
```sql
-- Users can only access their own registrations
CREATE POLICY "Users can view own registrations" ON trek_registrations
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create own registrations" ON trek_registrations
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
```

#### Storage Security (ID Proofs)
```sql
-- Users can only upload to their own folder
CREATE POLICY "Users can upload own ID proofs" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'id-proofs'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

### 7.2 Authentication & Authorization

#### User Roles & Permissions
```sql
-- User types enum
CREATE TYPE user_type AS ENUM ('trekker', 'admin', 'partner');

-- JWT claims include user type and partner info
-- Used for frontend authorization
```

#### Session Management
```typescript
// src/hooks/useAuth.ts
export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return { session, user, loading: !session };
}
```

#### Authentication Troubleshooting
**Common Issues & Solutions:**

**Problem: Auto-Login on Development**
If you're experiencing automatic login/redirect when accessing localhost, it's due to persistent Supabase authentication sessions.

**Root Cause:**
The Supabase client is configured with:
- `persistSession: true` - Saves sessions to localStorage
- `autoRefreshToken: true` - Automatically refreshes tokens
- `detectSessionInUrl: true` - Detects sessions from URL parameters

**Solutions:**

**Method 1: Browser Console Script (Quick Fix)**
```javascript
(function clearAuthSessions() {
  console.log('🧹 Clearing all authentication sessions...');

  // Clear localStorage
  const localKeys = Object.keys(localStorage);
  const authKeys = localKeys.filter(key =>
    key.includes('supabase') || key.includes('auth') || key.includes('itw-auth')
  );

  authKeys.forEach(key => {
    console.log(`Removing localStorage key: ${key}`);
    localStorage.removeItem(key);
  });

  // Clear sessionStorage
  const sessionKeys = Object.keys(sessionStorage);
  const sessionAuthKeys = sessionKeys.filter(key =>
    key.includes('supabase') || key.includes('auth') || key.includes('itw-auth')
  );

  sessionAuthKeys.forEach(key => {
    console.log(`Removing sessionStorage key: ${key}`);
    sessionStorage.removeItem(key);
  });

  console.log('✅ Authentication sessions cleared!');
  console.log('🔄 Refreshing page...');
  setTimeout(() => window.location.reload(), 1000);
})();
```

**Method 2: Clear Sessions Component**
Navigate to `/auth` (login page) and click "Clear All Sessions" if available.

**Method 3: Manual Browser Storage Clear**
1. Open Developer Tools (F12) → Application/Storage tab
2. Clear Local Storage, Session Storage, and Cookies for localhost:8080
3. Look for keys containing: `supabase`, `auth`, `itw-auth`

**Method 4: Incognito Mode**
Use incognito/private browsing or add `?incognito=true` to disable session persistence.

**Prevention:**
- Session timeout after 7 days of inactivity
- Better session management in AuthProvider
- Clear session utilities for debugging

### 7.3 Data Validation & Sanitization

#### Input Validation
```typescript
// Using Zod for schema validation
import { z } from 'zod';

const trekRegistrationSchema = z.object({
  trek_id: z.number().positive(),
  user_id: z.string().uuid(),
  indemnity_agreed: z.boolean().refine(val => val === true, {
    message: "Indemnity agreement is required"
  }),
  registration_type: z.enum(['individual', 'group']),
  special_requirements: z.string().optional(),
});

type TrekRegistration = z.infer<typeof trekRegistrationSchema>;
```

#### SQL Injection Prevention
```sql
-- Parameterized queries only
-- No direct string interpolation in SQL
CREATE OR REPLACE FUNCTION get_user_treks(user_id_param UUID)
RETURNS TABLE(trek_id BIGINT, name TEXT, status TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT te.trek_id, te.name, tr.status
  FROM trek_events te
  JOIN trek_registrations tr ON te.trek_id = tr.trek_id
  WHERE tr.user_id = user_id_param;
END;
$$;
```

---

## 8. Testing & Quality Assurance

### 8.1 Testing Strategy

#### Test Structure
```
src/
├── __tests__/              # Test files
│   ├── App.test.tsx       # App-level tests
│   ├── components/        # Component tests
│   └── hooks/             # Hook tests
└── setupTests.ts         # Test configuration
```

#### Testing Configuration
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
      ],
    },
  },
});
```

### 8.2 Testing Patterns

#### Component Testing
```typescript
// Component test example
import { render, screen } from '@testing-library/react';
import { TrekCard } from '@/components/trek/TrekCard';

describe('TrekCard', () => {
  it('renders trek information correctly', () => {
    const trek = {
      trek_id: 1,
      name: 'Everest Base Camp',
      difficulty: 'hard',
      cost: 25000,
      location: 'Nepal',
    };

    render(<TrekCard trek={trek} />);

    expect(screen.getByText('Everest Base Camp')).toBeInTheDocument();
    expect(screen.getByText('₹25,000')).toBeInTheDocument();
  });

  it('shows loading state when data is loading', () => {
    render(<TrekCard trek={null} loading={true} />);

    expect(screen.getByTestId('trek-card-skeleton')).toBeInTheDocument();
  });
});
```

#### Hook Testing
```typescript
// Hook test example
import { renderHook, act } from '@testing-library/react';
import { useTrekRegistration } from '@/hooks/useTrekRegistration';

describe('useTrekRegistration', () => {
  it('handles registration submission', async () => {
    const { result } = renderHook(() => useTrekRegistration());

    await act(async () => {
      await result.current.registerForTrek({
        trek_id: 1,
        indemnity_agreed: true,
      });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });
});
```

### 8.3 Quality Gates Implementation

#### Pre-commit Quality Checks
```bash
# Automated quality gates
npm run precommit  # TypeScript + ESLint + Tests

# Enhanced quality analysis
npm run quality-check:strict  # Strict mode + enhanced coverage

# Full project analysis (all agents)
npm run full-analysis  # Refactor + Bug detect + Auto-fix
```

#### Quality Metrics
| Metric | Target | Current Status |
|--------|--------|----------------|
| **Test Coverage** | 80%+ | ~85% (enhancing) |
| **ESLint Issues** | 0 errors | ✅ 0 errors |
| **TypeScript Errors** | 0 strict violations | ✅ 0 errors |
| **Security Vulnerabilities** | 0 moderate/high | ✅ Clean |
| **Accessibility Score** | 100/100 | ✅ WCAG 2.1 AA |
| **Performance Score** | 90+ | ✅ 95+ |

### 7.4 Continuous Integration

#### Git Workflow
```bash
# Feature development
git checkout -b feature/new-trek-filtering

# Quality checks before commit
npm run precommit

# Commit with confidence
git commit -m "feat: add advanced trek filtering"

# Push and create PR
git push origin feature/new-trek-filtering
```

#### Code Review Process
1. **Automated Checks**: Pre-commit hooks run automatically
2. **CI Pipeline**: Quality gates on PR creation
3. **Manual Review**: Team review for complex changes
4. **Deployment**: Automatic deployment on main branch merge

---

**Document Version**: 1.0  
**Last Updated**: October 26, 2025  
**Status**: Complete Implementation  
**Next Review**: January 2026

---

**For detailed implementation examples, see:**
- [Project Overview Guide](PROJECT_OVERVIEW.md)
- [Technical Architecture Guide](TECHNICAL_ARCHITECTURE.md#database-management-system)
- [Design System Reference](DESIGN_SYSTEM.md)
- [Communication System Guide](COMMUNICATION_SYSTEM.md)
