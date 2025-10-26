# Into The Wild - Adventure Platform

## 1. Overview

Welcome to **Into The Wild**! This is a comprehensive **Progressive Web App (PWA)** trekking platform that connects adventure seekers with curated trekking experiences across India.

## 📊 Current Platform Status

- **65+ Active Users** on the platform growing steadily
- **53+ Treks completed** with more being organized regularly
- **200+ WhatsApp community** members for real-time coordination
- **Mobile-first PWA** with native app-like experience

## ✅ Implementation Complete

The platform has been enhanced with comprehensive development standards and automated systems:

### 🏗️ **Architecture & Development Standards**

- ✅ **Docker-first development** workflow implemented
- ✅ **Strict TypeScript** configuration with no `any` types allowed
- ✅ **Comprehensive error handling** system with logging and user-friendly messages
- ✅ **Indian market standards** - ₹ currency, DD/MM/YYYY dates, GST calculations

### 🎨 **Design System & UI/UX**

- ✅ **Golden Hour color palette** fully implemented with semantic tokens
- ✅ **Dark mode support** across all components
- ✅ **Mobile-first responsive design** with touch targets ≥44px
- ✅ **Logo integration** on every page with hover effects

### 🏔️ **Trek Lifecycle & Communication**

- ✅ **Automated notification system** - T-7, T-3, T-1 reminders
- ✅ **WhatsApp integration** with group management
- ✅ **Registration confirmation** and payment verification workflows
- ✅ **Post-trek feedback** system (T+1, T+3, T+7)

### 🔒 **Security & Performance**

- ✅ **Row Level Security (RLS)** policies on all database tables
- ✅ **Input validation** and sanitization throughout
- ✅ **Rate limiting** and CORS configuration
- ✅ **PWA implementation** with offline support and install prompts

### 🧪 **Code Quality & Testing**

- ✅ **Comprehensive test suite** for critical functionality
- ✅ **ESLint configuration** with strict rules
- ✅ **Pre-commit hooks** with husky for quality gates
- ✅ **Automated type checking** and linting in build process

### 📱 **Mobile & Accessibility**

- ✅ **Touch-optimized interface** with proper safe areas
- ✅ **WCAG 2.1 AA compliance** for accessibility
- ✅ **Horizontal scroll** mobile trek cards
- ✅ **Progressive loading** with blur placeholders

The platform includes features for event management, user registration, expense tracking, packing list coordination, and comprehensive community features.

_(User: Please expand this section with a more detailed project vision, its primary goals, and the target audience.)_

## 2. Core Features & Workflows

This application seems to support several key functionalities:

- **User Authentication & Profiles:**
  - User signup (trekker, admin, micro-community partner) and login.
  - Profile management (bio, avatar, contact details, etc.).
  - Indemnity acceptance.
- **Trek Event Management:**
  - Creating, viewing, updating, and managing trek events (Implemented via a multi-step form in the admin panel for both creation and editing).
  - Details likely include name, description, category, difficulty, dates, location, cost/pricing, capacity, etc.
  - Trek Event Statuses & Basic Lifecycle: Admins can manage trek statuses (e.g., Draft, Upcoming, Open for Registration, Cancelled, Completed) which control visibility and registration availability (Implemented).
  - _(User: Describe the workflow for creating/managing a trek event.)_
- **Trek Discovery & Registration:**
  - Users can browse and search for available treks (Public listing filters out 'Draft' and 'Cancelled' treks).
  - Workflow for users to register for a trek:
    - Indemnity Acceptance: Users must accept indemnity terms before registering (Implemented).
    - Payment Proof: Users upload payment proof after initial registration (Implemented).
    - Admin Verification: Admins review payment proof and verify/complete the registration (Implemented).
    - Pickup location selection (Details to be confirmed).
  - _(User: Detail the trek discovery and registration process from a user's perspective.)_
- **Packing List Management:**
  - Generating and viewing packing lists for specific treks.
  - Distinguishing between mandatory and optional items.
  - _(User: Explain how packing lists are created, assigned, and used.)_
- **Expense Tracking & Splitting:**
  - Tracking expenses related to a trek.
  - Functionality for splitting expenses among participants.
  - Managing expense categories and potentially receipts.
  - _(User: Describe the expense submission and splitting workflow.)_
- **Travel Coordination:**
  - Features to help coordinate travel for trek participants (e.g., carpooling, pickup points).
  - _(User: Detail how travel coordination is handled.)_
- **Admin Panel & User Verification:**
  - Dedicated interface for administrators.
  - Managing users, potentially verifying micro-community partners.
  - Overseeing trek events (including status changes, participant management, payment verification).
  - _(User: Outline the key admin functionalities and the user verification process.)_
- **In-App Notifications (Basic - POC):**
  - **Database & RPCs (Implemented):** `notifications` table schema, related ENUMs, and RPC functions for creating, fetching, and marking notifications as read are in place (`..._create_notifications.sql`, `..._create_notification_rpc.sql`).
  - **Client-Side Hook (Partially Implemented):** `src/hooks/useNotifications.ts` is set up to interact with these RPCs. Core functions for fetching/updating notification state need completion.
  - **UI Components (Pending):** Notification bell icon, dropdown/list view for notifications.
  - **Server-Side Triggers (Pending):** Logic to automatically create notifications for key events (e.g., payment verification).
- **Comments & Ratings (Potentially):**
  - Users might be able to comment on treks or rate them.
  - _(User: If this feature exists, describe how it works.)_

_(User: Add or remove features based on the actual scope of your application. Provide more detailed descriptions for each workflow.)_

## 3. Tech Stack

- **Frontend:** React (Vite) - _Correction: Previously noted Next.js, but project structure and `vite.config.ts` indicate Vite._
- **Backend & Database:** Supabase (PostgreSQL, Auth, Storage, Edge Functions, Realtime)
- **Styling:** Tailwind CSS, shadcn/ui components
- **Language:** TypeScript
- **Package Management:** npm / bun (based on `package-lock.json` / `bun.lockb`)
- **Local Development:** Docker, Supabase CLI, Deno (for Edge Functions)

_(User: Verify and update this list as necessary.)_

## 4. Prerequisites for Development

- Node.js (LTS version recommended)
- npm (usually comes with Node.js) or bun
- Docker Desktop (running)
- Supabase CLI (Install/Update: `npm install supabase --global`)
- Deno (Install/Update: `irm https://deno.land/install.ps1 | iex` on PowerShell, then restart terminal)

## 5. Local Development Setup

1.  **Clone the Repository:**

    ```bash
    git clone <your-repository-url>
    cd into-the-wild
    ```

2.  **Install Frontend Dependencies:**

    ```bash
    npm install
    # OR if using bun
    # bun install
    ```

3.  **Initialize Supabase Locally:**
    - Ensure your Supabase project is linked (if you haven't done this already from a previous setup):
      ```bash
      supabase login
      supabase link --project-ref <your-project-ref>
      # Follow prompts to enter database password if needed.
      ```
    - Start the local Supabase services:
      ```bash
      supabase start
      ```
    - This will pull necessary Docker images and set up your local database, auth, storage, etc.
    - API URL, anon key, and other local Supabase details will be printed to the console. `supabase status` can be used to retrieve these later.
    - **Inbucket (Mail Catcher):** Access local emails (password resets, confirmations) via the Inbucket URL shown in `supabase status` (e.g., `http://127.0.0.1:54324`).

4.  **Set up Environment Variables:**
    - Create a `.env.local` file in the root of your project.
    - Add the Supabase URL and anon key. For Vite projects, these must be prefixed with `VITE_`:
      ```env
      VITE_SUPABASE_URL=http://127.0.0.1:54321 # Or your local Supabase API URL from 'supabase status'
      VITE_SUPABASE_ANON_KEY=<your-local-supabase-anon-key-from-supabase-status>
      # Add any other required environment variables
      ```
    - **Important:** Restart your Vite development server after creating or changing `.env.local`.

5.  **Run Database Migrations & Seeding:**
    - The local database schema is set up by `supabase start` based on your `supabase/migrations` folder.
    - To ensure a clean state and apply all migrations (including the squashed schema and subsequent ones like notifications), and to populate data:
      ```bash
      supabase db reset
      ```
    - This command will also execute `supabase/seed.sql` if it exists. Create this file to populate your database with initial/test data (e.g., sample treks, users, categories). This is crucial after a reset to have data to work with.

6.  **Generate Supabase Types for Client:**
    - After any database schema changes (including adding RPCs), regenerate TypeScript types for your Supabase client:
      ```bash
      supabase gen types typescript --local > src/integrations/supabase/types.ts
      ```

7.  **Deploy Edge Functions Locally:**

    ```bash
    supabase functions deploy --no-verify-jwt
    ```

    - Ensure Deno is installed and in your PATH.
    - An `supabase/functions/import_map.json` is used to manage Deno dependencies.

8.  **Run the Development Server (Frontend):**
    ```bash
    npm run dev
    # OR if using bun
    # bun run dev
    ```
    Your Vite application should now be running, typically on `http://localhost:8080` (or as specified in `vite.config.ts`).

## 6. Database Migrations

- Migrations are located in the `supabase/migrations` directory.
- The primary schema definition is `supabase/migrations/20250505155501_squashed_schema.sql`. Subsequent migrations (e.g., for notifications, RPCs) are applied in chronological order based on their filename timestamps.
- **Creating New Migrations:**
  - For schema changes, it's often best to make changes to your local database using Supabase Studio (accessible via `supabase status`, e.g., `http://127.0.0.1:54323`) or another database tool.
  - Then, diff the changes to create a new migration file:
    ```bash
    supabase db diff -f <migration_name>
    ```
  - Or, create an empty migration file and write SQL manually:
    ```bash
    supabase migration new <migration_name>
    ```
- **Applying Migrations:** Migrations are applied automatically during `supabase start` if they haven't been applied before. `supabase db reset` drops the local database, re-runs all migrations, and then runs `supabase/seed.sql`.

## 7. Edge Functions

- Edge Functions are located in the `supabase/functions` directory.
- Each function is a separate Deno module.
- **`signup-automation`:**
  - **Purpose:** Automates user onboarding tasks upon new user signup.
  - **Trigger:** Intended to be used with a Supabase Auth hook (e.g., `on_auth_user_created`).
  - **Actions:**
    - Updates `public.users` table with `user_type`, `partner_id`, indemnity status, verification status, etc.
    - Updates `auth.users.app_metadata` with `user_type` and `partner_id` for JWT claims.
  - **Dependencies:** Uses `@supabase/supabase-js` and `std/http/server.ts` via `supabase/functions/import_map.json`.
  - **Environment Variables (expected by the function, provided by Supabase runtime):**
    - `SUPABASE_URL`
    - `SUPABASE_SERVICE_ROLE_KEY`
- **Deploying Locally:** `supabase functions deploy --no-verify-jwt`
- **Import Maps:** A shared `supabase/functions/import_map.json` is used. Consider per-function import maps for more complex projects.

## 8. Design System Documentation

The complete UI/UX design system is documented in a streamlined set of master documents:

### Core Documentation

- **`UI_UX_DESIGN_SYSTEM_MASTER.md`** (v3.0 - Complete PWA Edition)
  - The comprehensive master document for all UI/UX design
  - Covers brand identity, visual design, components, responsive design, PWA features
  - Includes complete color palette, typography, spacing system, and animations
  - Documents accessibility standards and implementation roadmap
  - Latest version includes PWA capabilities and messaging/notifications strategy

- **`MESSAGING_NOTIFICATIONS_COMMUNICATION_SYSTEM.md`**
  - Complete strategy for in-app notifications, toasts, nudges, and user onboarding
  - WhatsApp integration guide (current manual setup + future Business API)
  - Trek lifecycle communication framework (discovery → registration → during → post-trek)
  - Admin notification tools and user preference center
  - Technical architecture: database schemas, API endpoints, background jobs

### Quick Reference Documentation

- **`DESIGN_QUICK_REFERENCE.md`**
  - Copy-paste ready code snippets for developers
  - Common component patterns and responsive design patterns
  - Animation classes and quick color palette reference

- **`IMPLEMENTATION_PHASES.md`**
  - Phased implementation roadmap
  - Priority-based task breakdown

- **`ADMIN_UI_UX_ACCESSIBILITY_FIX_POA.md`**
  - Accessibility fixes and WCAG 2.1 AA compliance patterns
  - Admin panel specific UI/UX improvements

- **`ACCESSIBILITY.md`**
  - Comprehensive accessibility guidelines
  - Testing procedures and compliance checklists

### Design Tokens & System

All design tokens (colors, spacing, typography, shadows) are implemented in:

- `src/index.css` - Global styles and CSS custom properties
- `tailwind.config.ts` - Tailwind configuration with custom theme
- `src/lib/utils.ts` - Utility functions including `cn()` for class merging

## 9. Available Scripts

_(User: List key scripts from your `package.json` here, e.g., `npm run dev`, `npm run build`, `npm run test`, `npm run lint` etc., and briefly describe what they do.)_

- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the application for production.
- `npm run preview`: Preview the production build locally.
- ...

## 10. Contributing

_(User: Add guidelines for contributing to the project if applicable. This might include coding standards, branch naming conventions, pull request processes, etc.)_

## 11. License

_(User: Specify the license for your project, e.g., MIT, Apache 2.0. If you don't have one, consider adding one.)_
This project is licensed under the [NAME OF LICENSE] License - see the LICENSE.md file for details.
