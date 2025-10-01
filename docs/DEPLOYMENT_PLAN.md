# Deployment Plan - Into the Wild

## Overview
This document outlines the deployment strategy for the "Into the Wild" trek management platform, a client-server application built with React frontend and Node/Express backend with PostgreSQL database.

## Recent Fixes (October 1, 2025)

### Fixed Issues
1. ✅ **TrekEvents.tsx - fetchEvents initialization error**
   - **Issue**: `Cannot access 'fetchEvents' before initialization`
   - **Fix**: Moved `fetchEvents` function definition before the `useEffect` that references it
   - **Files Modified**: `src/pages/TrekEvents.tsx`

2. ✅ **AdminPanel.tsx - Placeholder content removal**
   - **Issue**: Hardcoded placeholder data for dashboard metrics
   - **Fix**: Implemented real-time data fetching from Supabase:
     - Upcoming Treks: Counts events starting this month (excluding DRAFT/CANCELLED)
     - Pending Verifications: Users with `id_verification_status = 'pending'`
     - Total Users: Active count of all registered members
   - **Files Modified**: `src/pages/AdminPanel.tsx`

## Technology Stack

### Frontend
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19
- **UI Components**: Radix UI + shadcn/ui
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM v6.30.0
- **State Management**: React Hooks + Context API
- **Date Handling**: date-fns 4.1.0

### Backend
- **Database**: PostgreSQL (via Supabase)
- **BaaS**: Supabase (Auth, Database, Storage)
- **API**: Supabase Client (@supabase/supabase-js 2.49.4)

### Development Tools
- **Package Manager**: npm
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint 9.9.0
- **Node Version**: 18.x

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Application Configuration
VITE_APP_NAME="Into The Wild"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENV=production

# Security Configuration
VITE_MAX_FILE_SIZE=2097152
VITE_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp

# Rate Limiting (client-side)
VITE_RATE_LIMIT_REQUESTS=10
VITE_RATE_LIMIT_WINDOW=60000

# Feature Flags
VITE_ENABLE_GOOGLE_AUTH=true
VITE_ENABLE_FILE_UPLOADS=true
VITE_ENABLE_ANALYTICS=false
```

## Pre-Deployment Checklist

### 1. Code Quality
- [ ] Run linter: `npm run lint`
- [ ] Run tests: `npm run test:run`
- [ ] Check TypeScript compilation: `npm run build`
- [ ] Review and fix all TypeScript errors
- [ ] Remove console.logs from production code (optional)

### 2. Database Preparation (Supabase)
- [ ] Verify all migrations are applied
- [ ] Check RLS (Row Level Security) policies are configured
- [ ] Test database connections
- [ ] Verify `get_trek_participant_count` RPC function exists
- [ ] Ensure all required tables exist:
  - `users`
  - `trek_events`
  - `trek_registrations`
  - `trek_comments`
  - `notifications`
  - Other supporting tables

### 3. Security Review
- [ ] Verify authentication flows work correctly
- [ ] Test admin access controls
- [ ] Review API endpoint permissions
- [ ] Check file upload restrictions
- [ ] Verify CORS settings in Supabase dashboard
- [ ] Review security headers configuration

### 4. Environment Variables
- [ ] Create production `.env` file (DO NOT commit)
- [ ] Set `VITE_APP_ENV=production`
- [ ] Configure Supabase production URL and keys
- [ ] Verify all required environment variables are set

## Deployment Options

### Option 1: Netlify (Recommended)

**Configuration**: `netlify.toml` (already configured)

**Steps**:
1. Connect GitHub repository to Netlify
2. Configure environment variables in Netlify dashboard
3. Set build command: `npm run build`
4. Set publish directory: `dist`
5. Enable automatic deployments from `main` branch

**Environment Variables to Set in Netlify**:
```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_APP_ENV=production
```

**Netlify Features**:
- Automatic HTTPS
- CDN distribution
- Branch previews
- Form handling
- Serverless functions support

### Option 2: Vercel

**Configuration**: `vercel.json` (already configured)

**Steps**:
1. Install Vercel CLI: `npm i -g vercel`
2. Login: `vercel login`
3. Deploy: `vercel --prod`
   
**Or via Dashboard**:
1. Import project from GitHub
2. Configure environment variables
3. Deploy

**Environment Variables to Set in Vercel**:
Same as Netlify (see above)

### Option 3: Traditional Hosting (VPS/Cloud)

**Requirements**:
- Node.js 18.x or higher
- nginx (for reverse proxy)
- SSL certificate (Let's Encrypt recommended)

**Steps**:
1. Clone repository on server
2. Install dependencies: `npm install`
3. Build application: `npm run build`
4. Configure nginx to serve `dist` folder
5. Set up SSL certificate
6. Configure environment variables

**Example nginx configuration**:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /path/to/project/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

## Deployment Steps (Detailed)

### 1. Pre-Deploy Testing
```bash
# Install dependencies
npm install

# Run linter
npm run lint

# Run tests
npm run test:run

# Build for production
npm run build

# Preview build locally
npm run preview
```

### 2. Database Migration (Supabase)
```bash
# Ensure you're logged in to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push any pending migrations
supabase db push

# Verify migrations
supabase db remote commit
```

### 3. Deploy Application

**For Netlify**:
```bash
# Install Netlify CLI (optional)
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

**For Vercel**:
```bash
# Deploy
vercel --prod
```

### 4. Post-Deployment Verification

**Critical Tests**:
- [ ] Homepage loads correctly
- [ ] User authentication (sign up/sign in)
- [ ] Admin dashboard displays real metrics
- [ ] Trek events page loads without errors
- [ ] Event creation/editing (admin only)
- [ ] User profile functionality
- [ ] Comments and community features
- [ ] File uploads (if enabled)
- [ ] Mobile responsiveness

**Performance Checks**:
- [ ] Page load time < 3 seconds
- [ ] Lighthouse score > 90
- [ ] No console errors
- [ ] All API calls succeed

## Rollback Plan

If deployment fails or critical issues arise:

1. **Immediate Rollback** (Netlify/Vercel):
   - Use platform's rollback feature to previous deployment
   - Netlify: Deploys → Previous deploy → Publish
   - Vercel: Deployments → Previous deployment → Promote to Production

2. **Database Rollback** (if needed):
   ```bash
   # Revert to previous migration
   supabase db reset
   ```

3. **Emergency Hotfix**:
   - Create hotfix branch from last stable commit
   - Apply minimal fix
   - Deploy hotfix immediately

## Monitoring and Maintenance

### Recommended Tools:
- **Error Tracking**: Sentry or LogRocket
- **Analytics**: Google Analytics or Plausible
- **Uptime Monitoring**: UptimeRobot or Pingdom
- **Performance**: Vercel Analytics or Netlify Analytics

### Post-Deployment Tasks:
- [ ] Set up error monitoring
- [ ] Configure analytics
- [ ] Set up uptime monitoring
- [ ] Monitor database performance
- [ ] Review and optimize slow queries
- [ ] Set up backup schedule for database

## Performance Optimization

### Before Production:
- [ ] Enable lazy loading for routes
- [ ] Optimize images (use WebP format)
- [ ] Minify and compress assets
- [ ] Enable CDN for static assets
- [ ] Implement code splitting
- [ ] Add service worker for PWA (optional)

### Database Optimization:
- [ ] Add indexes on frequently queried columns
- [ ] Optimize RPC functions
- [ ] Enable connection pooling
- [ ] Set up database backups

## Security Hardening

### Application Level:
- [ ] Enable CSP (Content Security Policy) headers
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Validate all user inputs
- [ ] Sanitize data before rendering

### Database Level:
- [ ] Review RLS policies
- [ ] Limit API key permissions
- [ ] Enable audit logging
- [ ] Regular security audits

## India-Specific Compliance

### Date Format
- Use DD/MM/YYYY format throughout the application
- Configure date-fns with Indian locale

### GST Compliance (if applicable)
- Ensure invoice generation includes GST details
- Store GST numbers for registered users
- Generate GST-compliant receipts

### Data Privacy
- Comply with IT Act 2000
- Implement data retention policies
- Provide data export functionality
- Include privacy policy and terms of service

## Support and Troubleshooting

### Common Issues:

**Issue**: Build fails with TypeScript errors
**Solution**: Run `npm run build` locally and fix all TypeScript errors before deploying

**Issue**: Environment variables not loading
**Solution**: Ensure variables are prefixed with `VITE_` and platform is configured correctly

**Issue**: Database connection fails
**Solution**: Verify Supabase URL and keys, check RLS policies

**Issue**: 404 on direct URL access
**Solution**: Ensure SPA redirect is configured (already set in netlify.toml and vercel.json)

### Contact Information:
- **Repository**: [Your GitHub Repo URL]
- **Documentation**: `docs/` folder
- **Support**: [Support Email/Channel]

## Continuous Integration/Deployment

### Recommended CI/CD Pipeline:

```yaml
# Example GitHub Actions workflow
name: Deploy to Production

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run test:run
      - run: npm run build
      # Deploy step (platform specific)
```

## Changelog

### v1.0.0 - October 1, 2025
- Fixed TrekEvents initialization error
- Implemented real-time admin dashboard metrics
- Enhanced error handling
- Improved type safety

---

## Next Steps

1. Review this deployment plan
2. Complete pre-deployment checklist
3. Set up staging environment (recommended)
4. Perform deployment to staging
5. Run comprehensive tests
6. Deploy to production
7. Monitor for 24-48 hours
8. Document any issues and resolutions

**Last Updated**: October 1, 2025  
**Version**: 1.0.0  
**Status**: Ready for deployment

