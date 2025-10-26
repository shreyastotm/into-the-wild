# Into The Wild - Deployment Master Guide

## Overview
This consolidated guide covers all aspects of deploying the Into The Wild application, with a focus on Vercel deployment.

## Quick Reference

### Current Deployment
- URL: https://into-the-wild-cy3vews4w-shreyas-projects-2f83efe9.vercel.app

### Environment Setup
- **Frontend**: Vite + React
- **Backend**: Docker containers for local development
- **Database**: PostgreSQL via Supabase

## Deployment Process

### 1. Pre-Deployment Preparation

```bash
# Clean install dependencies (including optional dependencies)
npm ci

# Run type checking
npm run type-check

# Run linting
npm run lint

# Build the project
npm run build

# Verify the build output
npm run preview
```

#### Dependency Requirements
The project uses the following optional dependencies for production builds:
- **terser**: JavaScript minifier (required for Vite production builds)

If you encounter "terser not found" errors, install it:
```bash
npm install --save-dev terser
```

### 2. Environment Variables Setup

#### Required Variables
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_ENV=production
```

#### Additional Variables
```
VITE_APP_NAME=Into The Wild
VITE_APP_VERSION=0.4.2
VITE_MAX_FILE_SIZE=2097152
VITE_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
VITE_ENABLE_GOOGLE_AUTH=true
VITE_GST_RATE=18
VITE_DATE_FORMAT=DD/MM/YYYY
VITE_CURRENCY=INR
VITE_CURRENCY_SYMBOL=₹
```

### 3. Vercel Deployment

#### Option 1: Using Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select the Into The Wild project
3. Go to Settings > Environment Variables and verify all variables are set
4. Deploy from the main branch

#### Option 2: Using Vercel CLI
```bash
# Install Vercel CLI if not already installed
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

## Docker Development Environment

For local development, use Docker to run the database and backend:

```bash
# Start the database and backend
docker-compose up -d postgres backend

# Apply migrations
docker exec -it into-the-wild-postgres psql -U postgres -d into_the_wild -f /path/to/migrations.sql

# Stop containers
docker-compose down
```

## Troubleshooting Common Issues

### Build Failures

#### TypeScript errors
```
TS2322: Type '...' is not assignable to type '...'
```
**Solution**: Fix type issues or use `vite build` directly to skip type checking.

#### Memory issues
```
FATAL ERROR: Reached heap limit
```
**Solution**: Optimize bundle size or increase memory limit in Vercel settings.

#### Environment variable issues
```
ReferenceError: process is not defined
```
**Solution**: Ensure variables are prefixed with `VITE_` and accessed via `import.meta.env.VITE_...`.

#### Terser not found
```
[vite:terser] terser not found. Since Vite v3, terser has become an optional dependency.
```
**Solution**: Install terser as a dev dependency:
```bash
npm install --save-dev terser
```

#### Node.js version issues
```
Error: Node.js Version "18.x" is discontinued and must be upgraded
```
**Solution**: Update Node.js version in package.json:
```json
{
  "engines": {
    "node": "22.x"
  }
}
```

#### Vercel schema validation
```
should NOT have additional property `nodeVersion`
```
**Solution**: Remove `nodeVersion` from vercel.json and use `engines` field in package.json instead.

#### React chunking issues
```
Uncaught TypeError: Cannot read properties of undefined (reading 'useLayoutEffect')
```
**Solution**: Ensure React and React-DOM are bundled in the same chunk:
```typescript
// In vite.config.ts manualChunks
if (id.includes('react') || id.includes('react-dom') || 
    id.includes('scheduler') || id.includes('prop-types')) {
  return 'vendor-react';
}
```

### Runtime Errors

#### API connection issues
```
Error: Failed to fetch from Supabase
```
**Solution**: Verify Supabase URL and keys in environment variables.

#### Authentication errors
```
Error: Invalid JWT
```
**Solution**: Check Supabase auth configuration and site URL settings.

## Rollback Procedure

If deployment fails:

1. Go to Vercel Dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"
4. Fix issues locally and redeploy

## Performance Optimization

The application uses:
- Code splitting for vendor and feature chunks
- Lazy loading for all pages
- Optimized cache headers
- Bundle size optimization via tree shaking and minification

## Maintenance Schedule

### Daily
- Monitor error logs
- Check performance metrics

### Weekly
- Run full test suite
- Update dependencies
- Backup database

### Monthly
- Performance audit
- Security audit
- Code quality review
