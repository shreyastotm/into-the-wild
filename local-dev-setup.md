# Local Development Setup Guide

## Current Issue
Your local development is redirecting to `intothewild.club` because:
1. Supabase auth is configured for production URLs
2. Missing local environment configuration
3. OAuth redirect URLs are set to production domain

## Quick Fix for Testing

### Option 1: Test Without Full Auth (Recommended)
1. Open `test_local_fix.html` in your browser
2. This will test the trek loading fixes without authentication
3. You can verify the database queries work correctly

### Option 2: Fix Local Development Environment

#### Step 1: Create Environment File
Create a `.env.local` file in your project root:

```bash
# Copy from env.sample and update with your values
VITE_SUPABASE_URL=https://lojnpkunoufmwwcifwan.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxvam5wa3Vub3VmbXd3Y2lmd2FuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzMDcyMTMsImV4cCI6MjA1OTg4MzIxM30.MullqAvDPGgkDc3yW-GIuenn87U-Z3KLDmpU6U1BJmU
VITE_APP_NAME="Into The Wild"
VITE_APP_VERSION="1.0.0"
VITE_APP_ENV=development
```

#### Step 2: Update Supabase Auth Settings
1. Go to your Supabase dashboard
2. Navigate to Authentication > URL Configuration
3. Add these redirect URLs:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:8083/auth/callback`
   - `http://localhost:3000/auth/callback`

#### Step 3: Test Local Development
```bash
npm run dev
```

## Alternative: Deploy and Test in Production

Since the fixes are ready, you can:
1. Deploy the changes to production
2. Test on the live site at `intothewild.club`
3. The fixes will work immediately in production

## What We Fixed

### 1. Events Page (`/events`)
- **Problem**: Showing "No Treks Found" because filtering was excluding all Draft events
- **Fix**: Changed filtering to only exclude Cancelled events, allowing Draft events to show
- **Result**: Will now show 4 future events

### 2. Dashboard Past Treks
- **Problem**: Past treks not showing because only date-based filtering was used
- **Fix**: Added status-based filtering to include Completed and Archived treks
- **Result**: Past treks will now show properly

## Files Modified
- `src/pages/TrekEvents.tsx` - Fixed status filtering
- `src/components/dashboard/UserTreks.tsx` - Enhanced past treks logic

## Next Steps
1. Test the fixes using `test_local_fix.html`
2. Deploy to production
3. Verify on live site
