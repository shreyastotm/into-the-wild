# GA4 Setup Steps - Quick Reference

## Your GA4 Configuration

**Measurement ID:** `G-NW4MTHFT60`

## Step-by-Step Setup

### Step 1: Create `.env.local` File

Create a file named `.env.local` in the project root with:

```env
# Enable Google Analytics
VITE_ENABLE_ANALYTICS=true
VITE_GA4_MEASUREMENT_ID=G-NW4MTHFT60

# Add your other environment variables here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
# ... etc
```

**Important:** `.env.local` is gitignored (already configured), so your secrets stay local.

### Step 2: Restart Development Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

Environment variables are loaded when the server starts.

### Step 3: Accept Analytics Consent

1. Open your app in browser: `http://localhost:8080`
2. Wait 2 seconds - consent dialog appears
3. Click **"Accept Analytics"**
4. Page reloads - GA4 initializes automatically

### Step 4: Verify Setup

#### Quick Verification

Open browser console and check for:

```
[GA4] Analytics initialized successfully
[GA4] Page view tracked: /
```

#### Check Network Tab

1. Open DevTools → Network tab
2. Filter by "gtag"
3. Look for: `gtag/js?id=G-NW4MTHFT60` ✅

#### Check Real-Time Reports

1. Go to [Google Analytics](https://analytics.google.com/)
2. Select property: **G-NW4MTHFT60**
3. Reports → Real-Time
4. Navigate your app - should see your session!

## What's Already Configured

✅ **Analytics Hook** - `src/hooks/useGA4Analytics.ts`
✅ **Consent Component** - `src/components/AnalyticsConsent.tsx`
✅ **Layout Integration** - Analytics auto-initializes
✅ **Event Tracking** - GlassMorphismEventDetails page fully instrumented

## Events Being Tracked

### Automatic:

- Page views (all routes)
- User identification
- User properties (role, device type)

### In GlassMorphismEventDetails:

- Trek views
- Registration attempts
- Registration success/failure
- Gallery image views
- Share actions
- Button clicks

## Troubleshooting

### "Analytics not initializing"

1. Check `.env.local` has correct values
2. Restart dev server
3. Clear localStorage and accept consent again

### "Events not appearing"

1. Check Real-Time reports (not standard reports)
2. Verify consent is accepted: `localStorage.getItem('analytics-consent')`
3. Disable ad blockers temporarily

### "Console shows errors"

1. Check Measurement ID: `G-NW4MTHFT60`
2. Verify network requests to googletagmanager.com aren't blocked
3. Check browser console for specific error messages

## Production Deployment

When deploying:

1. Add to your hosting platform:

   ```
   VITE_ENABLE_ANALYTICS=true
   VITE_GA4_MEASUREMENT_ID=G-NW4MTHFT60
   ```

2. Rebuild and redeploy

3. Test in production - accept consent and verify tracking

## Ready to Go! 🚀

Your GA4 is fully configured. Just create `.env.local` and restart your server!
