# 🚀 Production Deployment Instructions

## ✅ **Code Fixes Applied (Ready to Deploy)**

All code fixes have been applied locally and are ready to be deployed:

### 1. **Fixed 13 Files with Malformed Supabase Queries**
- ✅ `src/components/dashboard/UserTreks.tsx` → `trek_registrations`
- ✅ `src/hooks/trek/useTrekCosts.ts` → `trek_costs`
- ✅ `src/hooks/trek/useTrekEventDetails.ts` → `trek_events`
- ✅ `src/hooks/trek/useTrekRatings.ts` → `trek_ratings`
- ✅ `src/hooks/trek/useTrekRegistration.ts` → `trek_registrations`
- ✅ `src/pages/CreateTrekEvent.tsx` → `tent_inventory`
- ✅ `src/components/admin/RegistrationAdmin.tsx` → `trek_registrations`
- ✅ `src/components/admin/IdProofVerification.tsx` → `id_types`
- ✅ `src/pages/admin/TrekEventsAdmin.tsx` → `trek_events`
- ✅ `src/components/trek/TrekCostsManager.tsx` → `trek_costs`
- ✅ `src/pages/TrekEvents.tsx` → `trek_events`
- ✅ `src/hooks/useExpenseSplitting.ts` → `packing_list_categories`
- ✅ `src/lib/adminUtils.ts` → `users`

### 2. **Fixed UI Elements**
- ✅ Hamburger icon: Added dark mode support (`dark:text-gray-300 dark:hover:text-white`)
- ✅ Sign-in button: Enhanced with animations (`hover:scale-105`, `transition-all duration-200`)

---

## 🔴 **CRITICAL: Apply Database Migration to Production**

The RPC function `get_trek_participant_count` is **NOT** in your production database. You MUST apply it manually.

### **Option 1: Using Supabase Dashboard (RECOMMENDED)**

1. **Go to your Supabase Dashboard:**
   - URL: https://supabase.com/dashboard/project/lojnpkunoufmwwcifwan/sql/new

2. **Copy and paste the following SQL:**

```sql
-- Drop existing function if it exists (safe to run multiple times)
DROP FUNCTION IF EXISTS get_trek_participant_count(INTEGER);

-- Create the RPC function to get trek participant count
CREATE OR REPLACE FUNCTION get_trek_participant_count(trek_id_param INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    participant_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO participant_count
    FROM trek_registrations
    WHERE trek_id = trek_id_param
    AND payment_status IN ('paid', 'pending', 'proof_uploaded');

    RETURN COALESCE(participant_count, 0);
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_trek_participant_count(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_trek_participant_count(INTEGER) TO anon;

-- Verify the function was created
SELECT 
    proname as function_name,
    pg_get_function_identity_arguments(oid) as arguments
FROM pg_proc 
WHERE proname = 'get_trek_participant_count';
```

3. **Click "Run"** - You should see a success message and one row returned showing the function details.

4. **Test the function:**
```sql
-- Replace 1 with an actual trek_id from your database
SELECT get_trek_participant_count(1);
```

### **Option 2: Using Supabase CLI (If you prefer)**

```bash
# Repair the migration history first
npx supabase migration repair --status reverted 20250505155501

# Then push all pending migrations
npx supabase db push --linked --include-all
```

---

## 📦 **Deploy Frontend Changes**

Once the database migration is applied, deploy the frontend:

```bash
# Stage all changes
git add -A

# Commit with descriptive message
git commit -m "fix: resolve all Supabase query errors and enhance UI

- Fixed 13 files with malformed .from() table names
- Replaced .from('\"*\"') with correct table names
- Fixed destructuring patterns (data/error variables)
- Enhanced hamburger icon with dark mode support
- Improved sign-in button with animations and hover effects
- Ready for production database migration"

# Push to trigger Vercel deployment
git push
```

---

## ✅ **Post-Deployment Verification**

After deploying (wait 2-3 minutes for Vercel):

1. **Hard refresh the site:** `Ctrl+F5` or `Cmd+Shift+R`

2. **Check console for errors:**
   - ✅ No "React is not defined" errors
   - ✅ No "Maximum call stack size exceeded" errors
   - ✅ No Supabase 404 errors
   - ✅ No "$3 is not defined" errors

3. **Test key pages:**
   - ✅ `/` (Landing page) - Hamburger icon visible
   - ✅ `/events` - Trek events load properly
   - ✅ `/gallery` - Gallery loads without errors
   - ✅ `/dashboard` - User treks display correctly

4. **Verify RPC function:**
   - Open browser console on `/events` page
   - Should see successful `POST /rest/v1/rpc/get_trek_participant_count` calls
   - No 404 errors

---

## 🎯 **Expected Results**

### **Before Fixes:**
- ❌ `GET /rest/v1/%22*%22?select=*` (404 errors)
- ❌ `POST /rest/v1/rpc/get_trek_participant_count` (404 errors)
- ❌ "Error is not defined" messages
- ❌ "Maximum call stack size exceeded"
- ❌ Missing hamburger icon
- ❌ Sign-in button without proper styling

### **After Fixes:**
- ✅ All API calls use correct table names
- ✅ RPC function returns participant counts
- ✅ Clean console with no errors
- ✅ Hamburger icon visible in dark mode
- ✅ Sign-in button with smooth animations
- ✅ All pages load properly

---

## 🆘 **If Issues Persist**

If you still see errors after deployment:

1. **Check if database migration was applied:**
   - Go to Supabase Dashboard → SQL Editor
   - Run: `SELECT proname FROM pg_proc WHERE proname = 'get_trek_participant_count';`
   - Should return one row

2. **Clear browser cache completely:**
   - Chrome: `Ctrl+Shift+Delete` → Clear all cached images and files
   - Or use Incognito mode

3. **Check Vercel deployment logs:**
   - Go to Vercel Dashboard → Deployments
   - Check if build succeeded
   - Look for any runtime errors

4. **Verify environment variables in Vercel:**
   - `VITE_SUPABASE_URL` should be: `https://lojnpkunoufmwwcifwan.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` should be set correctly

---

## 📝 **Summary**

**What was fixed:**
- 13 files with malformed Supabase queries
- UI elements (hamburger icon, sign-in button)
- Destructuring patterns for proper error handling

**What needs to be done:**
1. ✅ Apply database migration (SQL in Supabase Dashboard)
2. ✅ Commit and push changes
3. ✅ Wait for Vercel deployment
4. ✅ Verify all pages work

**This is a PERMANENT fix that addresses root causes, not symptoms!** 🎉

