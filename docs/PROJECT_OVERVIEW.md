# Into The Wild - Project Overview

## 📋 Table of Contents

1. [Project Fundamentals](#1-project-fundamentals)
2. [Tech Stack & Dependencies](#2-tech-stack--dependencies)
3. [Development Environment Setup](#3-development-environment-setup)
4. [Deployment & Production](#4-deployment--production)
5. [Quick Reference](#5-quick-reference)

---

## 1. Project Fundamentals

### 1.1 Project Vision

**Into The Wild** is a comprehensive **Progressive Web App (PWA)** trekking platform that connects adventure seekers with curated trekking experiences across India. The platform serves as a digital bridge between trekking enthusiasts and organized adventure activities, emphasizing safety, community, and authentic outdoor experiences.

### 1.2 Target Audience

- **Primary Users**: Adventure enthusiasts aged 25-45 seeking organized trekking experiences
- **Secondary Users**: Micro-community partners and trek organizers
- **Geographic Focus**: India (Pan-India coverage with mobile-first approach)
- **Platform Focus**: Mobile-first PWA with native app-like experience

### 1.3 Platform Status

| Metric | Current | Target |
|--------|---------|--------|
| **Active Users** | 65+ | 10,000+ |
| **Treks Completed** | 53+ | 1,000+ |
| **WhatsApp Community** | 200+ | 5,000+ |
| **Platform Type** | Mobile-first PWA | Native-like experience |

### 1.4 Core Features & Workflows

#### User Authentication & Profiles
- **Multi-role signup**: Trekker, Admin, Micro-community Partner
- **Profile management**: Bio, avatar, contact details, preferences
- **Indemnity acceptance**: Digital legal compliance workflow
- **User verification**: Admin approval process for partners

#### Trek Event Management
- **Comprehensive trek creation**: Multi-step admin form with validation
- **Event lifecycle management**: Draft → Upcoming → Open → Active → Completed
- **Status-based visibility**: Public listings exclude drafts and cancelled events
- **Rich metadata**: Name, description, category, difficulty, dates, location, cost, capacity

#### Trek Discovery & Registration
- **Advanced filtering**: Category, difficulty, date range, location, cost
- **Registration workflow**:
  1. Indemnity acceptance (mandatory)
  2. Payment proof upload
  3. Admin verification & approval
  4. Pickup location selection
- **Real-time availability**: Live participant count and capacity management

#### Communication & Notifications
- **Automated lifecycle messaging**: T-7, T-3, T-1 day reminders
- **WhatsApp integration**: Automated group creation and participant invitations
- **In-app notifications**: Real-time updates and announcements
- **Post-trek feedback**: Automated T+1, T+3, T+7 follow-up requests

#### Community Features
- **Forum system**: 25+ nature/adventure tags for discussions
- **User avatars**: Indian wildlife themes
- **Social sharing**: Trek experiences and photo galleries
- **Community badges**: Achievement and participation recognition

#### Admin Panel & Management
- **Comprehensive dashboard**: User management, trek oversight, analytics
- **Payment verification**: Admin approval workflow for registrations
- **Content moderation**: Forum management and user verification
- **Analytics & reporting**: Platform usage and engagement metrics

---

## 2. Tech Stack & Dependencies

### 2.1 Frontend Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Framework** | React | ^18.3.1 | UI component library |
| **Build Tool** | Vite | ^5.4.19 | Fast development & building |
| **Language** | TypeScript | ^5.5.3 | Type safety & development |
| **Routing** | React Router DOM | ^6.30.0 | Client-side navigation |
| **State Management** | TanStack Query | ^5.56.2 | Server state management |
| **Styling** | Tailwind CSS | ^3.4.11 | Utility-first CSS |
| **UI Components** | shadcn/ui | Latest | Pre-built components |
| **Icons** | Lucide React | ^0.462.0 | Icon library |
| **Analytics** | react-ga4 | ^2.1.0 | Google Analytics 4 integration |

### 2.2 Backend & Database

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Backend-as-a-Service** | Supabase | ^2.49.4 | Database, Auth, Storage |
| **Database** | PostgreSQL | Latest | Primary data storage |
| **Authentication** | Supabase Auth | ^2.49.4 | User management |
| **Storage** | Supabase Storage | ^2.49.4 | File uploads (images, docs) |
| **Real-time** | Supabase Realtime | ^2.49.4 | Live updates |
| **Edge Functions** | Supabase Edge Functions | Deno | Serverless functions |

### 2.3 Development & Quality Tools

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Testing** | Vitest | ^3.1.2 | Unit & integration testing |
| **Linting** | ESLint | ^9.9.0 | Code quality |
| **Code Formatting** | Prettier | ^3.x | Code consistency |
| **Type Checking** | TypeScript | ^5.5.3 | Static analysis |
| **Bundle Analysis** | Vite Bundle Analyzer | Built-in | Performance monitoring |
| **Accessibility** | @axe-core/cli | ^4.11.0 | WCAG compliance |
| **Performance** | Lighthouse | ^12.8.2 | Performance auditing |

### 2.4 Key Dependencies

#### Production Dependencies
```json
{
  "@dnd-kit/core": "^6.3.1",           // Drag & drop functionality
  "@radix-ui/*": "Latest",             // Accessible UI primitives
  "@supabase/supabase-js": "^2.49.4",  // Database & auth client
  "@tanstack/react-query": "^5.56.2",  // Data fetching & caching
  "leaflet": "^1.9.4",                 // Interactive maps
  "lucide-react": "^0.462.0",          // Icon system
  "react-ga4": "^2.1.0",               // Google Analytics 4 integration
  "react-hook-form": "^7.53.0",        // Form management
  "zod": "^3.24.2"                     // Schema validation
}
```

#### Development Dependencies
```json
{
  "@testing-library/react": "^16.3.0", // Component testing
  "@vitejs/plugin-react-swc": "^3.5.0", // Fast React compilation
  "eslint": "^9.9.0",                  // Code linting
  "husky": "^9.1.7",                   // Git hooks
  "tailwindcss": "^3.4.11",           // CSS framework
  "terser": "^5.44.0",                // Production minification
  "typescript": "^5.5.3",             // Type system
  "vitest": "^3.1.2"                  // Testing framework
}
```

### 2.5 System Requirements

| Component | Requirement | Notes |
|-----------|-------------|-------|
| **Node.js** | 22.x (LTS) | Required in package.json engines |
| **npm** | Latest | Package management |
| **Docker** | Latest | Local development |
| **Supabase CLI** | Latest | Database management |
| **Deno** | Latest | Edge Functions runtime |

---

## 3. Development Environment Setup

### 3.1 Prerequisites Installation

#### Node.js & npm
```bash
# Verify Node.js version (should be 22.x)
node --version
npm --version
```

#### Docker Desktop
- Download from [docker.com](https://docker.com)
- Ensure Docker Desktop is running
- Verify: `docker --version`

#### Supabase CLI
```bash
# Install globally
npm install supabase --global

# Verify installation
supabase --version
```

#### Deno (for Edge Functions)
```bash
# Windows PowerShell
irm https://deno.land/install.ps1 | iex

# Add to PATH and restart terminal
deno --version
```

### 3.2 Repository Setup

#### Clone Repository
```bash
git clone <your-repository-url>
cd into-the-wild
```

#### Install Dependencies
```bash
# Frontend dependencies
npm install

# Alternative with bun (if preferred)
bun install
```

### 3.3 Supabase Local Development

#### Initialize Supabase
```bash
# Login to Supabase (first time only)
supabase login

# Link to your project
supabase link --project-ref <your-project-ref>

# Start local Supabase services
supabase start
```

#### Access Local Services
- **Supabase Studio**: http://127.0.0.1:54323
- **API URL**: http://127.0.0.1:54321
- **Inbucket (Email)**: http://127.0.0.1:54324

### 3.4 Environment Configuration

#### Create Environment File
Create `.env.local` in project root:
```env
# Supabase Configuration (VITE_ prefix required for client-side access)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<your-local-anon-key>

# Google Analytics 4 (GA4) Configuration
# Get your Measurement ID from Google Analytics Dashboard (Format: G-XXXXXXXXXX)
VITE_ENABLE_ANALYTICS=true
VITE_GA4_MEASUREMENT_ID=G-NW4MTHFT60

# Add other environment variables as needed
```

**Note:** See [GA4 Analytics Integration Guide](docs/GA4_ANALYTICS_INTEGRATION.md) for complete setup instructions.

#### Restart Development Server
After updating `.env.local`:
```bash
# Stop current dev server (Ctrl+C)
npm run dev  # Restart to load new environment variables
```

### 3.5 Database Setup & Migrations

#### Apply Database Schema
```bash
# Reset database (applies all migrations + seed data)
supabase db reset

# This creates:
# - All tables with proper relationships
# - Row Level Security (RLS) policies
# - Functions and triggers
# - Sample data (if seed.sql exists)
```

#### Generate TypeScript Types
```bash
# Generate types from local database
supabase gen types typescript --local > src/integrations/supabase/types.ts
```

#### Deploy Edge Functions
```bash
# Deploy all Edge Functions locally
supabase functions deploy --no-verify-jwt
```

### 3.6 Development Server

#### Start Frontend Development
```bash
# Standard development
npm run dev
# OR with bun
bun run dev

# Server runs on: http://localhost:8080
```

#### Development with Quality Gates
```bash
# Full analysis before development
npm run dev:analyze

# This runs:
# - Code refactoring agent
# - Bug detection agent
# - Auto-fix agent
# - Then starts dev server
```

---

## 4. Deployment & Production

### 4.1 Build Configuration

#### Production Build
```bash
# Standard production build
npm run build

# Development build with type checking
npm run build:dev
```

#### Build Optimizations
- **Code Splitting**: Automatic chunk splitting by route and vendor
- **Minification**: Terser for production builds
- **Source Maps**: Enabled for debugging (can be disabled in production)
- **Bundle Analysis**: Built-in Vite bundle analyzer

### 4.2 Deployment Platform

#### Vercel Deployment (Recommended)
- **Automatic deployments** from main branch
- **Node.js 22.x** runtime (specified in package.json engines)
- **Environment variables** configured in Vercel dashboard
- **Build command**: `npm run build`
- **Output directory**: `dist`

#### Manual Deployment
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy dist/ folder to hosting platform
```

### 4.3 Environment Variables (Production)

Configure in your deployment platform:
```env
# Supabase Production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Add other production variables as needed
```

### 4.4 Health Checks & Monitoring

#### Production Health Checks
```bash
# Check if app is responding
curl https://your-domain.com

# Monitor console for errors
# Check Vercel deployment logs
# Monitor Supabase dashboard
```

#### Performance Monitoring
```bash
# Run Lighthouse audit
npm run analyze:performance

# Check bundle size
npm run analyze:bundle

# Accessibility audit
npm run analyze:accessibility
```

---

## 5. Quick Reference

### 5.1 Available Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `npm run dev` | Start development server | `npm run dev` |
| `npm run build` | Production build | `npm run build` |
| `npm run preview` | Preview production build | `npm run preview` |
| `npm run test` | Run tests | `npm run test` |
| `npm run lint` | Code linting | `npm run lint` |
| `npm run type-check` | TypeScript checking | `npm run type-check` |

### 5.2 Quality Gates

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `npm run precommit` | Pre-commit validation | Before committing |
| `npm run quality-check` | Standard quality check | Before deployment |
| `npm run quality-check:strict` | Enhanced quality check | Before production |
| `npm run full-analysis` | Complete analysis | Before major releases |

### 5.3 Indian Market Compliance

| Standard | Implementation | Verification |
|----------|----------------|-------------|
| **Currency** | ₹ symbol, Indian number formatting | `npm run check:indian-compliance` |
| **Date Format** | DD/MM/YYYY | Built into `formatIndianDate` utility |
| **GST Calculations** | 18% default GST | `calculateGST` function |
| **Mobile Optimization** | 320px minimum width | `npm run check:mobile-responsive` |
| **Touch Targets** | ≥44px touch areas | Design system compliance |

### 5.4 Key Directories

| Directory | Purpose | Key Files |
|-----------|---------|-----------|
| `src/` | Frontend source code | Components, pages, hooks, services |
| `supabase/` | Database & backend | Migrations, functions, config |
| `docs/` | Documentation | Master guides & references |
| `public/` | Static assets | Images, icons, manifests |
| `scripts/` | Quality automation | Agents & utilities |

### 5.5 Deployment & Production

#### Production Build
```bash
# Standard production build
npm run build

# Development build with type checking
npm run build:dev
```

#### Build Optimizations
- **Code Splitting**: Automatic chunk splitting by route and vendor
- **Minification**: Terser for production builds
- **Source Maps**: Enabled for debugging (can be disabled in production)
- **Bundle Analysis**: Built-in Vite bundle analyzer

#### Vercel Deployment (Recommended)
- **Automatic deployments** from main branch
- **Node.js 22.x** runtime (specified in package.json engines)
- **Environment variables** configured in Vercel dashboard
- **Build command**: `npm run build`
- **Output directory**: `dist`

#### Manual Deployment
```bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy dist/ folder to hosting platform
```

#### Environment Variables (Production)
Configure in your deployment platform:
```env
# Supabase Production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Add other production variables as needed
```

#### Health Checks & Monitoring
```bash
# Check if app is responding
curl https://your-domain.com

# Monitor console for errors
# Check Vercel deployment logs
# Monitor Supabase dashboard
```

#### Performance Monitoring
```bash
# Run Lighthouse audit
npm run analyze:performance

# Check bundle size
npm run analyze:bundle

# Accessibility audit
npm run analyze:accessibility
```

### 5.7 Quality Automation System

#### 8 Automated Quality Agents
The project implements a comprehensive automated quality system with 8 specialized agents:

| Agent | Purpose | Command | Integration |
|-------|---------|---------|-------------|
| **Code Refactoring Agent** | Automatic code improvements | `npm run refactor` | Pre-commit, quality gates |
| **Bug Detection Agent** | Issue identification | `npm run bug-detect` | Pre-commit, quality gates |
| **Auto-Fix Agent** | Intelligent fixes | `npm run auto-fix` | Pre-commit, quality gates |
| **Code Cleanup Agent** | Remove unused code | `npm run cleanup:code` | Quality gates |
| **Architecture Agent** | Structure optimization | `npm run analyze:structure` | Quality gates |
| **Beautification Agent** | Format and style | `npm run beautify:all` | Quality gates |
| **Deployment Validation Agent** | Production readiness | `npm run deploy:validate` | Pre-deployment |
| **📚 Documentation Agent** | Documentation workflow | `npm run docs:*` | All quality gates |

#### Documentation Agent Workflow
```bash
# Individual documentation commands
npm run docs:validate      # Validate master documents
npm run docs:consolidate   # Find and consolidate temporary docs
npm run docs:archive       # Archive old temporary docs
npm run docs:quality       # Check documentation quality
npm run docs:pre-deploy    # Pre-deployment documentation check

# Complete documentation workflow
npm run docs:full-check    # Run all documentation checks
```

#### Quality Gates with Documentation
```bash
# Standard quality check (includes documentation validation)
npm run quality-check      # TypeScript + ESLint + Tests + Documentation

# Enhanced quality check (strict mode with full documentation)
npm run quality-check:strict  # Strict mode + enhanced tests + full documentation workflow

# Complete project analysis (all 8 agents)
npm run full-analysis      # All quality agents including documentation
```

#### Deployment Authorization
```bash
# Pre-deployment validation (includes documentation)
npm run deploy:validate    # Complete quality + documentation check

# Manual deployment check
npm run deploy:check      # Manual confirmation required

# Ready for deployment (with DEPLOY command)
npm run deploy:ready      # Final validation + deployment message

# Quick deployment check (recommended)
npm run docs:pre-deploy   # Fast documentation validation
```

#### Documentation Workflow Integration
```bash
# Daily development workflow
npm run docs:validate     # Validate master documents
npm run docs:consolidate  # Handle temporary documentation
npm run docs:violations   # Check for rule violations

# Pre-commit workflow
npm run precommit         # Includes documentation validation

# Quality assurance
npm run quality-check     # Standard quality + documentation
npm run quality-check:strict  # Enhanced quality + full docs workflow

# Maintenance
npm run docs:full-check   # Complete documentation workflow
```

### 5.8 Getting Help

- **📚 Documentation**: See other master documents in `/docs/`
- **🐛 Issues**: Check console logs and error boundaries
- **🚀 Performance**: Run `npm run analyze:performance`
- **♿ Accessibility**: Run `npm run analyze:accessibility`
- **📱 Mobile**: Test on actual devices, not just browser dev tools

---

**Document Version**: 1.0  
**Last Updated**: October 26, 2025  
**Status**: Complete Implementation  
**Next Review**: January 2026

---

**For detailed technical implementation, see:**
- [Technical Architecture Guide](TECHNICAL_ARCHITECTURE.md)
- [Design System Reference](DESIGN_SYSTEM.md)
- [Communication System Guide](COMMUNICATION_SYSTEM.md)
