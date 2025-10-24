# RLS Infinite Recursion Fix

## Problem

The application was experiencing crashes with the error:

```
42P17: infinite recursion detected in policy for relation "users"
```

## Root Cause

The RLS policies on the `users` table had circular dependencies. Specifically, the `admin_full_access` policy was checking if a user is an admin by querying the `users` table itself:

```sql
CREATE POLICY "admin_full_access" ON public.users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE user_id = auth.uid()
            AND user_type = 'admin'
        )
    );
```

This created an infinite loop:

1. Query users table → Check RLS policy → Query users table again → Check RLS policy → ...

## Solution

### 1. Removed Admin Checks from RLS Policies

We removed ALL admin checks from the `users` table RLS policies to prevent recursion.

**New policies (no recursion):**

- `user_select_own`: Users can read their own profile
- `user_update_own`: Users can update their own profile
- `user_insert_own`: Users can insert their own profile (signup)
- `authenticated_read_all`: Authenticated users can read all profiles (for trek features)

### 2. Moved Admin Checks to Application Level

Created `src/lib/adminUtils.ts` with functions:

- `isCurrentUserAdmin()`: Check if current user is admin
- `isUserAdmin(userId)`: Check if specific user is admin
- `requireAdmin()`: Throw error if not admin

### 3. Migration File

Created `supabase/migrations/20250115000002_fix_users_rls_no_recursion.sql` to apply the fix.

## Security Implications

### What Changed

- **Before**: Admin checks were enforced at the database level (RLS)
- **After**: Admin checks are enforced at the application level

### Security Considerations

1. **User profiles are now readable by all authenticated users**
   - This is necessary for trek features (viewing participants, etc.)
   - Sensitive fields should be handled separately if needed

2. **Admin operations must be checked in application code**
   - Use `isCurrentUserAdmin()` before admin operations
   - Protect admin routes with `ProtectedRoute` component
   - Validate admin status on the server side for critical operations

3. **RLS still protects user data**
   - Users can only update/delete their own profiles
   - Authentication is still required for all operations

## Testing

After applying this fix:

- ✅ All pages load without crashes
- ✅ Users can view their profiles
- ✅ Users can update their own profiles
- ✅ Trek features work (viewing participants, etc.)
- ✅ Admin features work when checked at application level

## Future Improvements

1. Consider using Supabase Edge Functions for server-side admin checks
2. Add audit logging for admin operations
3. Create a more sophisticated permission system if needed

## Related Files

- `supabase/migrations/20250115000002_fix_users_rls_no_recursion.sql`
- `src/lib/adminUtils.ts`
- `src/components/ProtectedRoute.tsx`
