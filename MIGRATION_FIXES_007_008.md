# Migration Fixes for 007 & 008

## Issue
Both migration files had type mismatch errors when referencing the `users` table. The error was:
```
ERROR: 42883: operator does not exist: bigint = uuid
HINT: No operator matches the given name and argument types. You might need to add explicit type casts.
```

## Root Cause
The `users` table uses `user_id` as the primary key column (UUID type), but the RLS policies and RPC functions were incorrectly using `id` instead of `user_id`.

## Files Fixed

### 1. `supabase/migrations/20250120000007_forum_tags_system.sql`

**Fixed 2 occurrences:**

**Line 76** - RLS Policy for `forum_tags_admin_all`:
```sql
-- BEFORE:
EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')

-- AFTER:
EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin')
```

**Line 102** - RLS Policy for `forum_thread_tags_admin_all`:
```sql
-- BEFORE:
EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND user_type = 'admin')

-- AFTER:
EXISTS (SELECT 1 FROM public.users WHERE user_id = auth.uid() AND user_type = 'admin')
```

### 2. `supabase/migrations/20250120000008_forum_tags_rpc.sql`

**Fixed 3 occurrences:**

**Line 122** - Function `add_thread_tags`:
```sql
-- BEFORE:
SELECT 1 FROM public.users WHERE id = v_user_id AND user_type = 'admin'

-- AFTER:
SELECT 1 FROM public.users WHERE user_id = v_user_id AND user_type = 'admin'
```

**Line 162** - Function `remove_thread_tags`:
```sql
-- BEFORE:
SELECT 1 FROM public.users WHERE id = v_user_id AND user_type = 'admin'

-- AFTER:
SELECT 1 FROM public.users WHERE user_id = v_user_id AND user_type = 'admin'
```

**Line 202** - Function `get_threads_by_tag`:
```sql
-- BEFORE:
WHERE ftag.slug = p_tag_slug
AND ft.deleted_at IS NULL

-- AFTER:
WHERE ftag.slug = p_tag_slug
-- Removed deleted_at check as column doesn't exist in forum_threads table
```

## Verification
All references to `users` table now correctly use `user_id` column instead of `id`.

## Next Steps
1. Run migration 007 in Supabase dashboard
2. Run migration 008 in Supabase dashboard
3. Verify tags system works in the forum UI
4. Test avatar picker shows only working images

## Status
✅ Migration 007 - Fixed
✅ Migration 008 - Fixed
✅ Ready to apply to database

