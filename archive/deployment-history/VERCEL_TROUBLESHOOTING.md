# 🔧 Vercel Deployment Troubleshooting Guide

## Into The Wild - Common Issues & Solutions

**Quick reference for resolving deployment issues**

---

## 🚨 Build Failures

### Issue: "Build failed with exit code 1"

**Possible Causes & Solutions:**

#### 1. TypeScript Errors

```bash
# Check locally first
npx tsc --noEmit

# If errors found, fix them before deploying
```

**Common TypeScript Issues:**

- Missing type imports
- Incorrect prop types
- Unused variables
- Type mismatches

#### 2. Missing Dependencies

```bash
# Make sure all dependencies are in package.json
npm install

# Check for missing peer dependencies
npm ls
```

**Solution:**

```bash
# If you see "missing" packages, install them
npm install missing-package --save
```

#### 3. Environment Variables Not Set

**Check in Vercel Dashboard:**

- Settings → Environment Variables
- Verify all `VITE_` prefixed variables are set
- Make sure they're enabled for "Production"

**Required Variables:**

```
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

#### 4. Build Command Failed

**Verify in Vercel Dashboard:**

- Settings → General → Build & Development Settings
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

---

## 🚨 Runtime Errors

### Issue: "Cannot read properties of undefined"

**Check These:**

1. **Environment Variables Not Loading**

```javascript
// Add this to your app entry point (main.tsx) to debug
console.log("Environment check:", {
  hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
});
```

**Solution:**

- Verify environment variables in Vercel Dashboard
- Redeploy after adding variables
- Clear Vercel cache if needed

2. **Supabase Client Not Initialized**

```typescript
// Check src/integrations/supabase/client.ts
// Ensure environment variables are validated

if (!SUPABASE_URL) {
  throw new Error("Missing VITE_SUPABASE_URL");
}
```

**Solution:**

- Add environment variables
- Check for typos in variable names
- Ensure `VITE_` prefix is present

---

### Issue: "404 Not Found" on Page Refresh

**Cause:** SPA routing not configured properly

**Solution:**
Your `vercel.json` should have this rewrite rule:

```json
{
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

✅ **Already configured in your project!**

If still getting 404s:

- Check `vercel.json` is in root directory
- Redeploy the project
- Clear Vercel cache

---

### Issue: "Failed to fetch" or Network Errors

**Possible Causes:**

#### 1. CORS Issues

**Check Supabase Dashboard:**

- Settings → API → CORS
- Add your Vercel domain: `https://your-app.vercel.app`

**Allowed Origins Should Include:**

```
https://your-app.vercel.app
https://*.vercel.app (for preview deployments)
https://your-custom-domain.com (if applicable)
```

#### 2. Wrong Supabase URL

**Verify:**

```bash
# Check your environment variable
# Should be: https://YOUR_PROJECT.supabase.co
# NOT: http://127.0.0.1:54321 (that's local!)
```

**Solution:**

- Update `VITE_SUPABASE_URL` in Vercel
- Redeploy

#### 3. Network Timeout

**If requests are slow/timing out:**

- Check Supabase status: https://status.supabase.com/
- Check your database query performance
- Consider adding indexes to frequently queried columns

---

## 🚨 Authentication Issues

### Issue: "OAuth redirect mismatch"

**For Google OAuth:**

1. **Check Supabase Dashboard:**
   - Authentication → URL Configuration
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs should include:
     ```
     https://your-app.vercel.app/**
     https://*.vercel.app/** (for previews)
     ```

2. **Check Google Cloud Console:**
   - APIs & Services → Credentials
   - OAuth 2.0 Client IDs
   - Authorized redirect URIs should include:
     ```
     https://YOUR_PROJECT.supabase.co/auth/v1/callback
     ```

### Issue: "Email confirmation not working"

**Check Supabase Settings:**

- Authentication → Providers → Email
- **Enable Confirmations:** Should be `false` for testing
- Or set up proper SMTP for production emails

**Email Templates:**

- Authentication → Email Templates
- Verify confirmation template is correct
- Check redirect URL in template

### Issue: "Invalid refresh token"

**Solutions:**

1. **Clear Browser Storage:**

```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
```

2. **Check Token Expiry:**
   - Supabase → Authentication → Settings
   - JWT Expiry: Default is 3600 seconds (1 hour)
   - Refresh Token Rotation: Enabled

3. **Force Re-authentication:**
   - Sign out all users
   - Clear sessions in Supabase dashboard
   - Users sign in again

---

## 🚨 Database Issues

### Issue: "Row Level Security policy violation"

**Cause:** RLS policies not configured correctly

**Check These Tables:**

- `users` - Can users read their own data?
- `trek_events` - Can public view non-draft events?
- `trek_registrations` - Can users see their registrations?
- `payment-proofs` storage bucket - Correct policies?

**Debug RLS:**

```sql
-- Test as specific user in Supabase SQL Editor
SET request.jwt.claims.sub = 'user-uuid-here';

-- Try your query
SELECT * FROM users WHERE id = 'user-uuid-here';
```

**Solutions:**

1. Review policies in Supabase Dashboard → Authentication → Policies
2. Verify policies allow necessary access
3. Check if policies use correct column names (auth.uid() vs user_id)

### Issue: "Function does not exist"

**Missing RPC Functions:**

**Verify these exist in Supabase:**

```sql
-- Check in SQL Editor
SELECT proname FROM pg_proc
WHERE proname LIKE '%trek%' OR proname LIKE '%notification%';
```

**Expected Functions:**

- `get_trek_participant_count`
- `create_notification`
- `mark_notification_as_read`
- `get_user_notifications`
- `is_admin`

**Solution:**

```bash
# Push missing migrations
supabase db push

# Or manually run migration files in Supabase SQL Editor
```

### Issue: "Column does not exist"

**Cause:** Migrations not applied to production database

**Solution:**

```bash
# Check which migrations are applied
supabase db remote commit

# Push pending migrations
supabase db push

# Or apply manually in Supabase SQL Editor
```

---

## 🚨 Storage/Upload Issues

### Issue: "Storage bucket not found"

**Create Missing Buckets:**

1. **In Supabase Dashboard → Storage:**
   - Create bucket: `payment-proofs` (private)
   - Create bucket: `avatars` (public)
   - Create bucket: `trek-images` (public)

2. **Set Bucket Policies:**

**For `payment-proofs` (private):**

```sql
-- Users can upload their own payment proofs
CREATE POLICY "Users can upload payment proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-proofs' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Admins can view all payment proofs
CREATE POLICY "Admins can view payment proofs"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs' AND
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND user_type = 'admin')
);
```

### Issue: "File size limit exceeded"

**Check:**

1. Client-side validation:
   - `VITE_MAX_FILE_SIZE=2097152` (2MB)
2. Supabase bucket settings:
   - Storage → Bucket → Settings
   - File size limit: 50MB (default)

**Adjust if needed:**

- Change `VITE_MAX_FILE_SIZE` environment variable
- Update bucket settings in Supabase

### Issue: "Invalid file type"

**Check:**

```env
VITE_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/webp
```

**Validation logic should be in upload component:**

```typescript
const allowedTypes = import.meta.env.VITE_ALLOWED_IMAGE_TYPES.split(",");
if (!allowedTypes.includes(file.type)) {
  throw new Error("Invalid file type");
}
```

---

## 🚨 Performance Issues

### Issue: "Slow page load"

**Diagnose:**

1. Run Lighthouse audit
2. Check Vercel Analytics
3. Check Supabase logs for slow queries

**Common Fixes:**

1. **Large Bundle Size:**

```bash
# Analyze bundle
npm run build

# Check dist folder size
du -sh dist/*

# Look for large files
find dist -type f -size +100k
```

**Solution:** Code splitting, lazy loading

2. **Slow Database Queries:**
   - Check Supabase → Database → Query Performance
   - Add indexes to frequently queried columns
   - Optimize queries with large JOINs

3. **Too Many API Calls:**
   - Check Network tab in DevTools
   - Implement caching with React Query
   - Batch similar requests

### Issue: "Out of memory during build"

**In Vercel Dashboard:**

- Settings → Environment Variables
- Add: `NODE_OPTIONS=--max-old-space-size=4096`

**Or optimize build:**

```javascript
// vite.config.ts
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom"],
          "ui-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
          ],
        },
      },
    },
  },
});
```

---

## 🚨 Environment Variable Issues

### Issue: "Environment variables not loading"

**Common Mistakes:**

1. **Missing `VITE_` Prefix**

```env
❌ SUPABASE_URL=...
✅ VITE_SUPABASE_URL=...
```

2. **Wrong Environment Selected**
   - Check "Production" is selected
   - Variables must be set for each environment

3. **Not Redeployed After Adding Variables**
   - Must redeploy for changes to take effect
   - Or use "Redeploy" button in Vercel

**Debug:**

```javascript
// Temporarily add to your app
console.table({
  VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
    ? "Set"
    : "Missing",
  VITE_APP_ENV: import.meta.env.VITE_APP_ENV,
});
```

**Solution:**

1. Add variables in Vercel Dashboard
2. Enable for all environments
3. Redeploy
4. Remove debug console.log

---

## 🚨 Deployment Configuration Issues

### Issue: "Wrong build output"

**Check vercel.json:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

**Verify locally:**

```bash
npm run build
ls -la dist/
# Should contain: index.html, assets/, favicon.ico
```

### Issue: "Build succeeds but site shows 404"

**Possible Causes:**

1. **Wrong output directory**
   - Should be `dist` for Vite
   - Check Vercel Settings → Build & Development Settings

2. **No index.html in output**

```bash
# After local build
ls dist/index.html
# Should exist
```

3. **Framework preset wrong**
   - Should be "Vite" not "Create React App"

---

## 🔍 Debugging Tips

### Check Vercel Logs

1. **Build Logs:**
   - Vercel Dashboard → Deployments
   - Click on deployment
   - View "Building" logs

2. **Function Logs:**
   - Vercel Dashboard → Your Project
   - Click "Logs" tab
   - Filter by time range

3. **Real-time Logs:**

```bash
vercel logs YOUR_DEPLOYMENT_URL --follow
```

### Check Supabase Logs

1. **API Logs:**
   - Supabase Dashboard → Logs → API
   - Filter by status code (400, 500)
   - Check request details

2. **Database Logs:**
   - Supabase Dashboard → Logs → Database
   - Look for slow queries
   - Check for errors

3. **Auth Logs:**
   - Supabase Dashboard → Logs → Auth
   - Check login attempts
   - Verify OAuth flows

### Browser DevTools

**Console Tab:**

- Check for JavaScript errors
- Look for failed network requests
- Verify environment variables (temporarily log them)

**Network Tab:**

- Filter by "XHR" or "Fetch"
- Check failed requests (red)
- Verify API endpoints are correct
- Check request/response headers

**Application Tab:**

- Check Local Storage for auth tokens
- Verify Supabase session data
- Clear storage if needed

---

## 🚀 Quick Fixes Checklist

When something goes wrong, try these in order:

1. **Clear Vercel Cache:**
   - Vercel Dashboard → Project Settings
   - Scroll to "Build & Development Settings"
   - Toggle "Automatically cache" off and on

2. **Redeploy:**
   - Vercel Dashboard → Deployments
   - Latest deployment → "..." → Redeploy

3. **Check Environment Variables:**
   - All `VITE_` prefixed?
   - Production environment selected?
   - Redeployed after changes?

4. **Verify Supabase Connection:**
   - URL correct (not localhost)?
   - Anon key correct?
   - CORS configured?

5. **Test Locally:**

```bash
npm run build
npm run preview
# If works locally but not on Vercel, it's env vars
```

6. **Check Git Branch:**
   - Are you deploying the right branch?
   - Is latest code pushed to GitHub?

---

## 📞 Still Stuck?

### Gather This Information:

1. **Error Message:**
   - Exact error text
   - Stack trace
   - Where it occurs (build/runtime)

2. **Deployment URL:**
   - Copy from Vercel Dashboard

3. **Build Logs:**
   - Export from Vercel

4. **Browser Console:**
   - Screenshot of errors

5. **What You've Tried:**
   - List debugging steps taken

### Get Help:

**Vercel Support:**

- Dashboard: https://vercel.com/help
- Community: https://github.com/vercel/vercel/discussions

**Supabase Support:**

- Discord: https://discord.supabase.com
- Community: https://github.com/supabase/supabase/discussions

**Project Team:**

- Open GitHub issue
- Share gathered information
- Tag relevant team members

---

**Document Version:** 1.0  
**Last Updated:** October 4, 2025  
**Status:** ✅ Ready for Use

---

## 💡 Pro Tips

1. **Always test locally first:** `npm run build && npm run preview`
2. **Use preview deployments:** Test PRs before merging to main
3. **Monitor after deploy:** Watch logs for first 30 minutes
4. **Keep credentials secure:** Never commit `.env` files
5. **Document custom fixes:** Add to this guide for future reference

**Good luck! 🚀**
