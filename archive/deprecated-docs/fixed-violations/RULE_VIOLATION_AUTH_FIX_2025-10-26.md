# Authentication Auto-Login Issue Fix

## Problem Description
If you're experiencing automatic login/redirect when accessing localhost, it's likely due to persistent Supabase authentication sessions stored in your browser.

## Root Cause
The Supabase client is configured with:
- `persistSession: true` - Saves sessions to localStorage
- `autoRefreshToken: true` - Automatically refreshes tokens
- `detectSessionInUrl: true` - Detects sessions from URL parameters

When the app loads, the AuthProvider automatically checks for existing sessions and logs you in if found.

## Solutions

### Method 1: Browser Console Script (Quick Fix)
1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Copy and paste this script:
```javascript
(function clearAuthSessions() {
  console.log('🧹 Clearing all authentication sessions...');

  const localKeys = Object.keys(localStorage);
  const authKeys = localKeys.filter(key =>
    key.includes('supabase') || key.includes('auth') || key.includes('itw-auth')
  );

  authKeys.forEach(key => {
    console.log(`Removing localStorage key: ${key}`);
    localStorage.removeItem(key);
  });

  const sessionKeys = Object.keys(sessionStorage);
  const sessionAuthKeys = sessionKeys.filter(key =>
    key.includes('supabase') || key.includes('auth') || key.includes('itw-auth')
  );

  sessionAuthKeys.forEach(key => {
    console.log(`Removing sessionStorage key: ${key}`);
    sessionStorage.removeItem(key);
  });

  console.log('✅ Authentication sessions cleared!');
  console.log('🔄 Refreshing page...');
  setTimeout(() => window.location.reload(), 1000);
})();
```
4. Press Enter to execute
5. The page will refresh automatically

### Method 2: Using the Clear Sessions Component
1. Navigate to `/auth` (login page)
2. If you see a red "Authentication Issue" card, click "Clear All Sessions"
3. The page will refresh and you should be able to access the login form

### Method 3: Manual Browser Storage Clear
1. Open Developer Tools (F12)
2. Go to Application/Storage tab
3. Clear:
   - Local Storage for localhost:8080
   - Session Storage for localhost:8080
   - Cookies for localhost:8080
4. Look for keys containing: `supabase`, `auth`, `itw-auth`
5. Refresh the page

### Method 4: Incognito Mode
1. Open the site in an incognito/private browsing window
2. This automatically disables session persistence
3. Use `?incognito=true` in the URL for extra safety

## Prevention
The updated configuration now includes:
- Session timeout after 7 days of inactivity
- Better session management in the AuthProvider
- Clear session utilities for debugging

## Testing
After clearing sessions:
1. You should be able to access the login page without auto-redirect
2. Sign in should work normally
3. Sessions should persist appropriately after manual login

## Files Modified
- `src/integrations/supabase/client.ts` - Added session timeout
- `src/components/auth/AuthProvider.tsx` - Improved session handling
- `src/components/auth/ClearAuthSessions.tsx` - New component for clearing sessions
- `src/utils/clearAuthSessions.ts` - Utility functions
- `src/pages/Auth.tsx` - Added clear sessions component to auth page
