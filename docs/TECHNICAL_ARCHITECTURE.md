# Into The Wild - Technical Architecture Guide

## 📋 Table of Contents

1. [Project Structure](#1-project-structure)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Backend & Database Architecture](#3-backend--database-architecture)
4. [Database Management System](#4-database-management-system)
5. [Interaction System Architecture](#5-interaction-system-architecture)
6. [Development Standards & Quality](#6-development-standards--quality)
7. [Performance & Optimization](#7-performance--optimization)
8. [Security & Database](#8-security--database)
9. [Testing & Quality Assurance](#9-testing--quality-assurance)

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
│   ├── GlassMorphismLanding.tsx # Main glassmorphism landing page
│   ├── GlassMorphismLandingTrial.tsx # Trial landing page with Karnataka/Bengaluru focus
│   ├── Auth.tsx         # Authentication page
│   ├── Dashboard.tsx    # User dashboard
│   ├── TrekEvents.tsx   # Events listing
│   ├── GlassMorphismEvents.tsx # Glass-themed events page
│   ├── GlassMorphismGallery.tsx # Gallery page (PublicGallery)
│   └── admin/           # Admin pages
├── components/landing/  # Landing page components
│   ├── EventCardsPreview.tsx # Event preview cards with DB integration
│   └── GalleryPreview.tsx # Gallery preview with DB integration
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

#### Routing Structure

The application uses React Router v6 for client-side navigation:

**Main Routes:**
- `/` - Main landing page (Index)
- `/landing-trial` - Trial landing page with Karnataka/Bengaluru focus, anime sketch effects
- `/events` - Events listing page (main)
- `/glass-events` - Glass-themed events page (alternate)
- `/events/:id` - Individual event details
- `/gallery` - Public gallery page (routes from `/glass-gallery` redirect here)
- `/dashboard` - User dashboard
- `/profile` - User profile
- `/forum` - Community forum
- `/login` - Authentication page
- `/admin/*` - Admin panel routes (protected)

**Note**: Gallery buttons route to `/gallery` (not `/glass-gallery`). The route `/gallery` maps to `GlassMorphismGallery` component.

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
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Server state (API data)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
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
  const result = await api.get(
    `/data?filter=${currentFilter}&sort=${currentSort}`,
  );
  setData(result);
}, []); // ✅ Empty dependencies

useEffect(() => {
  fetchData("initial");
}, [fetchData]);
```

**Pattern 2: Primitive Dependencies Only**

```typescript
const [searchTerm, setSearchTerm] = useState("");
const [sortBy, setSortBy] = useState("date");

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
    "strict": false, // Note: Currently relaxed for development speed
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
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
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

| Command                  | Description                              | Usage                                   |
| ------------------------ | ---------------------------------------- | --------------------------------------- |
| `npm run db:sync`        | Synchronize local and remote databases   | Full sync including conflict resolution |
| `npm run db:validate`    | Validate schema health and RLS policies  | Health check with detailed reporting    |
| `npm run db:consolidate` | Consolidate migrations into clean schema | Creates single consolidated migration   |
| `npm run db:backup`      | Create timestamped database backup       | Backup current state                    |
| `npm run db:health`      | Run comprehensive health checks          | Quick health assessment                 |

##### Complete Workflows

| Command                 | Description                       | When to Use               |
| ----------------------- | --------------------------------- | ------------------------- |
| `npm run db:dev`        | Start development with validation | Daily development         |
| `npm run db:dev:reset`  | Reset and sync development        | After major changes       |
| `npm run db:prod-sync`  | Production synchronization        | Before deployment         |
| `npm run db:full-setup` | Complete setup from scratch       | Initial setup or recovery |

#### Database Schema

##### Core Tables

| Table                | Purpose                          | Key Features                          |
| -------------------- | -------------------------------- | ------------------------------------- |
| `users`              | User profiles and authentication | Extended profile fields, RLS policies |
| `trek_events`        | Trek event definitions           | Complete lifecycle management         |
| `trek_registrations` | User registrations for treks     | Multi-step registration process       |
| `trek_expenses`      | Expense tracking                 | Fair sharing system                   |
| `notifications`      | User notifications               | Real-time and scheduled               |
| `forum_*`            | Community forum system           | Categories, threads, posts, voting    |

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
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  );

  // Function logic here
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
```

---

## 5. Interaction System Architecture

### 5.1 Phase 5 Database Schema

#### Core Interaction Tables

**Nudges System** (`public.nudges`)

- Behavioral psychology-driven contextual prompts
- Triggers: onboarding, engagement, retention, conversion, social
- Types: contextual, milestone, social_proof, urgency, recurring
- Priority levels: low, medium, high, critical
- Intelligent frequency rules and condition-based display
- Analytics tracking for optimization

**Profile Completion Funnel** (`public.profile_completion_stages`)

- Gamified onboarding with 5 stages: avatar (20%), bio (40%), interests (60%), verification (80%), social (100%)
- Status tracking: not_started, in_progress, completed, skipped
- Completion percentage calculation
- Milestone celebration system

**Enhanced Notifications** (`public.enhanced_notifications`)

- Multiple toast variants: success, error, info, warning, milestone, celebration, nudge, social
- Intelligent positioning and timing
- Context-aware messaging
- User preference respecting

**Social Features Foundation** (Multiple Tables)

**User Connections** (`public.user_connections`)
- Connection ID: UUID primary key
- Requester/Addressee: Bidirectional relationships
- Status: pending, accepted, blocked
- Connection Type: friend, follower
- Mutual tracking: mutual_friends_count, mutual_treks_count
- Timestamps: requested_at, responded_at, connected_at
- Indexes: requester_id, addressee_id, status
- RLS: Users can view own connections, admins see all

**User Posts** (`public.user_posts`)
- Post ID: UUID primary key
- User ID: References users(user_id) with CASCADE delete
- Content: TEXT (required), media_urls JSONB array
- Post Type: text, image, video, trek_share
- Trek Association: trek_id, registration_id (optional)
- Engagement Metrics: like_count, comment_count, share_count, view_count (default 0)
- Visibility: public, friends, private (default: friends)
- Features: is_pinned, is_featured (boolean flags)
- Location: location_name, latitude, longitude (DOUBLE PRECISION)
- Metadata: tags JSONB array [{ user_id, x, y }], mentions JSONB array
- Timestamps: created_at, updated_at
- Indexes: user_id, trek_id, visibility, created_at (optimized for queries)
- RLS Policies:
  - SELECT: Own posts OR public OR (friends visibility AND accepted connection) OR admin
  - INSERT: Only own user_id
  - UPDATE: Own posts OR admin
  - DELETE: Own posts OR admin
- Migration: Applied via `REMOTE_APPLY_user_posts.sql` (February 2026)

**Post Reactions** (`public.post_reactions`)
- Reaction ID: UUID primary key
- Post ID: References user_posts(post_id) with CASCADE delete
- User ID: References users(user_id) with CASCADE delete
- Reaction Type: like, love, laugh, wow, sad, angry (VARCHAR 50)
- Emoji: VARCHAR(10) for reaction emoji
- Timestamps: reacted_at, created_at, updated_at
- Constraint: UNIQUE(post_id, user_id) - one reaction per user per post
- Indexes: post_id, user_id (optimized for reaction queries)
- RLS Policies:
  - SELECT: All reactions visible to authenticated users
  - INSERT: Only own user_id
  - DELETE: Only own reactions
- Migration: Applied via `REMOTE_APPLY_user_posts.sql` (February 2026)

**Image Tagging System**
- Image-to-tag associations through `public.image_tag_assignments`
- Multi-tag filtering and category-based organization
- Friend tagging on gallery past adventures (Phase 5B feature)

**Analytics & Tracking**

- `public.user_interactions`: Comprehensive user behavior tracking
- `public.transition_states`: State management analytics
- `public.nudge_analytics`: Nudge performance metrics
- **GA4 Analytics**: Google Analytics 4 integration for business intelligence
  - Privacy-compliant tracking with consent management
  - Automatic page view tracking
  - Custom event tracking (treks, registrations, gallery, forum)
  - Indian market context (INR currency, India country)
  - Integration with internal behavioral tracking system

#### Phase 5 Enum Types

- `nudge_type_enum`: contextual, milestone, social_proof, urgency, recurring
- `nudge_trigger_enum`: onboarding, engagement, retention, conversion, social
- `nudge_priority_enum`: low, medium, high, critical
- `profile_stage_enum`: avatar, bio, interests, verification, social
- `profile_completion_status_enum`: not_started, in_progress, completed, skipped
- `toast_variant_enum`: success, error, info, warning, milestone, celebration, nudge, social

#### Functions Created

- `calculate_profile_completion(user_uuid UUID)`: Calculates overall profile completion
- `create_profile_milestone(user_uuid UUID, stage profile_stage_enum)`: Creates milestones for celebrations
- `track_user_interaction(user_uuid UUID, interaction_type VARCHAR(100), context_data JSONB)`: Tracks user actions
- `get_active_nudges(user_uuid UUID)`: Retrieves active nudges for a user
- `update_nudge_shown()`: Trigger-based nudge tracking

#### Storage Buckets (5 Total)

- `avatars` (public): User profile pictures and avatars
- `trek-images` (public): Trek photos and videos shared by users
- `id-proofs` (private): Government ID verification documents
- `payment-proofs` (private): Payment confirmation screenshots
- `forum-media` (public): Forum images, videos, and attachments

### 5.2 Behavioral Psychology Engine

**Nudge System Architecture**

- Context-aware display logic
- Frequency-based rule engine
- Device and behavior-based personalization
- A/B testing support via analytics

**Nudge Templates & Triggers**

The nudge system uses behavioral psychology principles to guide user actions:

**Onboarding Nudges** (Trigger: onboarding)
- `first_profile_setup`: Complete your profile to unlock features
- `complete_profile`: Join 1000+ trekkers with complete profiles
- `continue_momentum`: You're 20% there! Complete your profile to unlock more

**Engagement Nudges** (Trigger: engagement)
- `first_trek_urgency`: Limited spots available for your first trek!
- `trek_discovery`: Discover treks matching your interests
- `community_join`: Connect with fellow trekkers on your next adventure

**Retention Nudges** (Trigger: retention)
- `trek_recommendation`: Based on your profile, you might enjoy these treks
- `social_connection`: Tag friends in your trek photos to share memories
- `profile_update`: Update your interests to get better trek recommendations

**Conversion Nudges** (Trigger: conversion)
- `registration_complete`: Complete your registration to secure your spot
- `payment_pending`: Secure your trek spot - payment verification pending
- `early_bird`: Register early to get exclusive discounts

**Social Nudges** (Trigger: social)
- `friend_connect`: Connect with friends who share your trek interests
- `post_share`: Share your trek experience with the community
- `tag_friends`: Tag friends in gallery photos to relive memories together

**Nudge Psychology Types**

- **Contextual**: Context-aware prompts based on current page/action
- **Milestone**: Celebrate achievements and progress markers
- **Social Proof**: Leverage community actions ("Join 1000+ trekkers")
- **Urgency**: Create time-sensitive motivation (limited spots)
- **Recurring**: Periodic reminders for incomplete actions

**Nudge Priority Levels**

- **Low** (1-3): Informational nudges, non-critical suggestions
- **Medium** (4-6): Important but not urgent guidance
- **High** (7-8): Important actions requiring attention
- **Critical** (9-10): Blocking issues or time-sensitive actions

**Frequency Rules**

- Same nudge won't show within 24 hours (configurable)
- User can dismiss nudges with "Don't show again" option
- Nudges respect user preferences and quiet hours
- Analytics track nudge effectiveness for optimization

**Profile Completion Psychology**

- Milestone-based motivation
- Progress visualization
- Achievement unlocks
- Social proof integration

### 5.3 Enhanced Toast System

**Toast Hierarchy**

- Standard: info, success, warning, error
- Elevated: milestone, celebration
- Behavioral: nudge, social

**Intelligent Positioning**

- Top-center for critical alerts
- Bottom-right for standard notifications
- Context-specific placement based on user preferences

### 5.4 Social Features Engine

**Connection System**

- Bidirectional friend relationships
- Follow/unfollow capabilities
- Mutual connection tracking

**Post Engagement**

- Create, read, update, delete posts
- Like/unlike functionality
- Comment threads
- Share tracking

**Image Tagging System**

- Tag creation and management
- Image-to-tag associations
- Multi-tag filtering
- Category-based organization

### 5.5 GA4 Analytics Integration

**Implementation**

- **Library**: `react-ga4` v2.1.0 for React integration
- **Hook**: `useGA4Analytics()` - Custom hook for tracking
- **Consent**: GDPR-compliant consent management component
- **Initialization**: Automatic on app load (after consent)

**Setup & Configuration**

Environment variables required:
```env
VITE_ENABLE_ANALYTICS=true
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Features**

- Privacy-compliant tracking with consent management
- Automatic page view tracking on route changes
- Custom event tracking for business metrics
- User identification and property tracking
- Indian market context (INR currency, India country code)
- Integration with internal behavioral tracking system
- Dual tracking support (GA4 + internal behavioral system)

**Available Tracking Methods**

| Method | Description | Parameters |
|--------|-------------|------------|
| `trackEvent` | Generic event tracking | `(eventName: string, parameters?: object)` |
| `trackTrekRegistration` | Track trek registrations | `(trekId: string, trekName: string, cost: number)` |
| `trackPaymentSuccess` | Track payment completion | `(amount: number, trekId: string, transactionId?: string)` |
| `trackGalleryView` | Track gallery image views | `(imageId: string, trekName?: string)` |
| `trackForumInteraction` | Track forum actions | `(action: string, threadId?: string)` |
| `trackProfileCompletion` | Track profile completion | `(completionPercentage: number)` |
| `trackButtonClick` | Track button clicks | `(buttonName: string, context?: object)` |
| `trackFormSubmit` | Track form submissions | `(formName: string, success: boolean, data?: object)` |
| `trackNavigation` | Track navigation clicks | `(destination: string, linkText?: string)` |
| `trackError` | Track errors | `(errorMessage: string, errorType?: string, context?: object)` |

**Events Tracked**

- Page views (automatic on navigation)
- Trek views and registrations
- Gallery image views
- Forum interactions
- Payment success events
- Profile completion milestones
- Social sharing actions
- Button clicks and form submissions

**Privacy & GDPR Compliance**

- Consent management with localStorage persistence
- IP anonymization enabled by default
- Google signals disabled (privacy-first)
- Ad personalization disabled
- User can revoke consent anytime
- No personal data shared beyond Google Analytics

**Usage Example**

```typescript
import { useGA4Analytics } from '@/hooks/useGA4Analytics';

function TrekRegistrationForm() {
  const { trackTrekRegistration } = useGA4Analytics();

  const handleRegistration = async (trekData: TrekEvent) => {
    trackTrekRegistration(trekData.id, trekData.name, trekData.cost);
    await registerForTrek(trekData);
  };
}
```

**Documentation References**

- Complete Setup: [GA4_ANALYTICS_INTEGRATION.md](docs/GA4_ANALYTICS_INTEGRATION.md)
- Quick Start: [GA4_QUICK_START.md](docs/GA4_QUICK_START.md)
- Setup Steps: [GA4_SETUP_STEPS.md](docs/GA4_SETUP_STEPS.md)
- Verification: [GA4_SETUP_VERIFICATION.md](docs/GA4_SETUP_VERIFICATION.md)

### 5.6 Performance Monitoring

**Guarantees**

- 60fps animation guarantee with CSS transforms
- Database query optimization through RLS
- Real-time analytics without blocking

**Metrics Tracked**

- Nudge performance (impressions, clicks, dismissals)
- Profile completion rates by stage
- Social feature adoption
- User interaction patterns
- GA4 business intelligence metrics

---

## 6. Phase 5B: Page Modernization & Social Features Implementation

### 6.1 Component Updates for Phase 5B

#### Glass Morphism Card Component

```tsx
// Apply to all card components across pages
interface ModernCardProps {
  className?: string;
  glassMorphism?: boolean;
  darkMode?: boolean;
  hoverEffect?: "scale" | "shadow" | "glow";
}

const ModernCard = ({
  className,
  glassMorphism = true,
  hoverEffect = "shadow",
}: ModernCardProps) =>
  cn(
    "relative overflow-hidden rounded-2xl",
    "bg-white/10 dark:bg-gray-800/10",
    glassMorphism &&
      "backdrop-blur-md border border-white/20 dark:border-gray-700/20",
    hoverEffect === "shadow" && "hover:shadow-2xl",
    hoverEffect === "scale" && "hover:scale-105 hover:shadow-2xl",
    hoverEffect === "glow" && "hover:shadow-[0_0_30px_rgba(244,164,96,0.3)]",
    "transition-all duration-300",
    className,
  );
```

### 6.2 Page Modernization Checklist

#### 1. Landing Page (Index.tsx) → Use Index.v2.tsx

- ✅ Replace old index with modern continuous scroll
- ✅ Apply glass morphism to all CTAs
- ✅ Add background blur and gradient overlays
- ✅ Implement parallax effects
- ✅ Mobile-responsive from 320px
- ✅ Dark mode support

#### 2. Events Page (TrekEvents.tsx)

- ✅ Apply ModernCard to EventCard components
- ✅ Implement horizontal scroll for mobile
- ✅ Add glass morphism styling
- ✅ Desktop: 3-4 column grid
- ✅ Tablet: 2 column with scroll
- ✅ Mobile: 1 column horizontal scroll
- ✅ Add social proof indicators (participant count, reviews)

#### 3. Gallery Page (PublicGallery.tsx)

- ✅ Apply glass morphism to gallery cards
- ✅ Implement friend tagging UI system
- ✅ Add image hover effects and overlays
- ✅ Implement tag markers with avatars
- ✅ Responsive layouts (mobile/tablet/desktop)
- ✅ Add social interaction buttons (like, comment, tag)

#### 4. Admin Pages (AdminPanel.tsx)

- ✅ Desktop: Wider sidebar (256px)
- ✅ Larger touch targets (48px minimum)
- ✅ Enhanced spacing and typography
- ✅ Improved form layouts for desktop
- ✅ Mobile: Hamburger menu with bottom sheet

#### 5. Profile Completion Overlay (Layout.tsx)

- ✅ Context-aware visibility rules
- ✅ Mobile-responsive positioning
- ✅ Hide on admin/event details pages
- ✅ Safe area support for notches

### 6.3 Responsive Design Implementation

#### Mobile-First Breakpoints (All Components)

```tsx
// Tailwind breakpoints applied consistently
const RESPONSIVE_CLASSES = {
  container: "px-4 sm:px-6 md:px-8 lg:px-12",
  grid: "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
  gap: "gap-4 sm:gap-6 md:gap-8 lg:gap-12",
  card: {
    mobile: "h-48 rounded-xl p-3",
    tablet: "h-56 rounded-2xl p-4",
    desktop: "h-64 rounded-2xl p-6",
  },
};
```

#### Touch Target Compliance

```tsx
// All interactive elements meet minimum 44px (mobile) / 48px (desktop)
const TOUCH_TARGETS = {
  mobile: "h-11 w-11", // 44px minimum
  desktop: "h-12 w-12", // 48px recommended
  icon: "h-5 w-5", // Inside buttons
  spacing: "gap-2 sm:gap-3", // Min 8px between targets
};
```

### 6.4 Animation & Performance Standards

#### 60fps Animation Guarantee

```tsx
// Only use transform and opacity for GPU acceleration
const PERFORMANCE_SAFE_ANIMATIONS = {
  transform: "translate3d(0,0,0)",
  opacity: "opacity-0 to opacity-100",
  noColorChanges: true,
  noBorderRadiusChanges: true,
  useWillChange: "will-change: transform, opacity",
};
```

#### Loading State Hierarchy

```tsx
// Progressive loading for better UX
const LOADING_STATES = {
  skeleton: "Skeleton screens for initial load",
  shimmer: "Shimmer effect for content updates",
  spinner: "Loading spinner for actions",
  progressive: "Progressive image loading with blur placeholders",
};
```

---

## 7. Development Standards & Quality

### Phase 5B Implementation Phase

**Status**: Ready for implementation  
**Timeline**: 3 weeks  
**Priority**: High (affects all user-facing pages)

**Deliverables**:

1. ✅ Landing page modernization
2. ✅ Events page UI update
3. ✅ Gallery page social features
4. ✅ Admin page desktop optimization
5. ✅ Profile completion overlay fixes
6. ✅ Complete responsive design implementation

---

**Document Version**: 2.1 (Phase 5B Ready)  
**Last Updated**: February 26, 2026  
**Status**: Phase 5B Implementation Started  
**Next Review**: February 16, 2026

---

**For detailed implementation examples, see:**

- [Project Overview Guide](PROJECT_OVERVIEW.md)
- [Technical Architecture Guide](docs/TECHNICAL_ARCHITECTURE.md#5-interaction-system-architecture)
- [Design System Reference](DESIGN_SYSTEM.md)
- [Communication System Guide](COMMUNICATION_SYSTEM.md)
- [Phase 5 Interaction System Guide](PHASE5_INTERACTION_SYSTEM.md)
