# Remote Database Migration Checklist

## Migration Files to Apply

Apply these SQL files **in order** via Supabase SQL Editor to fix 404 errors on production.

### 1. ✅ PRIMARY MIGRATION (Most Important)

**File:** `REMOTE_APPLY_user_posts.sql`

- **Fixes:** `user_connections` and `user_posts` 404 errors
- **Creates:**
  - `user_connections` table (friend system)
  - `user_posts` table (social posts)
  - `post_reactions` table (likes/reactions)
  - All RLS policies and indexes

### 2. Profile Features

**File:** `REMOTE_APPLY_profile_milestones.sql`

- **Creates:** `profile_milestones` table (achievement system)

### 3. Profile Completion

**File:** `REMOTE_APPLY_profile_completion.sql`

- **Creates:** `profile_completion` table (profile progress tracking)

### 4. Optional (if needed)

**File:** `REMOTE_APPLY_user_connections.sql`

- **Note:** Only needed if you haven't applied `REMOTE_APPLY_user_posts.sql` yet
- `REMOTE_APPLY_user_posts.sql` already includes `user_connections` creation

---

## Quick Start

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `REMOTE_APPLY_user_posts.sql`
3. Paste and run in SQL Editor
4. Refresh production site - 404 errors should be resolved

---

## Tables Created Summary

| Table                | Migration File                      | Status      |
| -------------------- | ----------------------------------- | ----------- |
| `user_connections`   | REMOTE_APPLY_user_posts.sql         | ✅ Included |
| `user_posts`         | REMOTE_APPLY_user_posts.sql         | ✅ Included |
| `post_reactions`     | REMOTE_APPLY_user_posts.sql         | ✅ Included |
| `profile_milestones` | REMOTE_APPLY_profile_milestones.sql | ⏳ Optional |
| `profile_completion` | REMOTE_APPLY_profile_completion.sql | ⏳ Optional |

---

## Verification Steps

After applying migrations, verify in Supabase Dashboard → Table Editor:

1. ✅ `public.user_connections` exists
2. ✅ `public.user_posts` exists
3. ✅ `public.post_reactions` exists
4. ✅ RLS policies are enabled for all tables
5. ✅ Refresh https://www.intothewild.club/gallery - no 404 errors

---

## Notes

- All migrations use `CREATE TABLE IF NOT EXISTS` - safe to run multiple times
- All migrations include proper RLS policies and grants
- Code already handles missing tables gracefully (returns empty arrays)
- Apply `REMOTE_APPLY_user_posts.sql` first - it fixes the current production errors
