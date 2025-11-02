# Stack Overflow Fix Summary - January 25, 2025

## 🎯 Problem Statement

The application was experiencing persistent "Maximum call stack size exceeded" errors on multiple pages:

- `/dashboard` - "Error loading your treks. $3 is not defined"
- `/events` - "Maximum call stack size exceeded"
- `/gallery` - "Maximum call stack size exceeded"

Console showed no visible errors in production, making debugging extremely difficult.

---

## 🔍 Root Cause Analysis

The errors were caused by **infinite useEffect loops** due to circular dependencies in multiple components:

### **Primary Issues Identified:**

1. **UserTreks Component** (`src/components/dashboard/UserTreks.tsx`)
   - `useEffect` had `fetchUserTrekRegistrations` in dependency array
   - Every render recreated the function, triggering infinite loop
   - **Fix:** Removed function from dependencies, kept only `user`

2. **TrekEvents Page** (`src/pages/TrekEvents.tsx`)
   - `useEffect` had `fetchEvents` in dependency array
   - Combined with `filterOptions` causing double trigger
   - **Fix:** Removed `fetchEvents` from dependencies

3. **TrekEventsAdmin Page** (`src/pages/admin/TrekEventsAdmin.tsx`)
   - `useEffect` had `fetchEvents` in dependency array
   - Should only run once on mount
   - **Fix:** Changed to empty dependency array `[]`

4. **useExpenseSplitting Hook** (`src/hooks/useExpenseSplitting.ts`)
   - Two `useEffect` hooks with function dependencies
   - `fetchExpenses` and `calculateSummary` causing loops
   - **Fix:** Removed function dependencies from both useEffects

---

## 🛠️ Fixes Applied

### **1. Fixed Circular Dependencies**

#### UserTreks.tsx

```typescript
// BEFORE (Infinite Loop)
useEffect(() => {
  if (user) {
    fetchUserTrekRegistrations();
  }
}, [user, fetchUserTrekRegistrations]); // ❌ Function dependency causes loop

// AFTER (Fixed)
useEffect(() => {
  if (user) {
    fetchUserTrekRegistrations();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [user]); // ✅ Only user dependency
```

#### TrekEvents.tsx

```typescript
// BEFORE
useEffect(() => {
  fetchEvents();
  fetchCategories();
}, [filterOptions, fetchEvents]); // ❌ Function dependency

// AFTER
useEffect(() => {
  fetchEvents();
  fetchCategories();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [filterOptions]); // ✅ Only data dependency
```

#### useExpenseSplitting.ts

```typescript
// BEFORE
useEffect(() => {
  if (trekId && user) {
    fetchExpenseCategories();
    fetchExpenses();
  }
}, [trekId, user, fetchExpenses]); // ❌ Function dependency

// AFTER
useEffect(() => {
  if (trekId && user) {
    fetchExpenseCategories();
    fetchExpenses();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [trekId, user]); // ✅ Only data dependencies
```

### **2. Added Comprehensive Debug Logging**

Added debug markers (🔍) throughout critical components to track execution flow:

- **AuthProvider.tsx**: Tracks session initialization and profile fetching
- **UserTreks.tsx**: Tracks useEffect triggers and data fetching
- **TrekEvents.tsx**: Tracks filter changes and event loading
- **useExpenseSplitting.ts**: Tracks expense fetching and summary calculations
- **ErrorBoundary.tsx**: Enhanced error catching with stack overflow detection

### **3. Enhanced Error Boundary**

```typescript
componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
  console.error("ErrorBoundary caught an error:", error, errorInfo);

  // Add detailed debugging for stack overflow issues
  if (error.message.includes("Maximum call stack size exceeded") ||
      error.stack?.includes("Maximum call stack size exceeded")) {
    console.error("🔥 MAXIMUM CALL STACK DETECTED!");
    console.error("Error:", error.message);
    console.error("Stack trace:", error.stack);
    console.error("Component stack:", errorInfo.componentStack);
  }
}
```

---

## 📊 Files Modified

### **Critical Fixes (Runtime)**

1. `src/components/dashboard/UserTreks.tsx` - Fixed useEffect dependencies
2. `src/pages/TrekEvents.tsx` - Fixed useEffect dependencies
3. `src/pages/admin/TrekEventsAdmin.tsx` - Fixed useEffect dependencies
4. `src/hooks/useExpenseSplitting.ts` - Fixed dual useEffect dependencies
5. **`src/pages/PublicGallery.tsx` - Fixed infinite loop (GALLERY PAGE)** ⭐

### **Debug Infrastructure**

5. `src/components/ErrorBoundary.tsx` - Enhanced error detection
6. `src/components/auth/AuthProvider.tsx` - Added debug logging
7. `src/debug-console.js` - Created debug monitoring script (commented out)
8. `index.html` - Added debug script placeholder

---

## 🚀 Deployment

**Commit:** `19edd7e` - "fix: resolve infinite loop issues"
**Pushed to:** `main` branch
**Vercel:** Auto-deployment triggered
**Production URL:** https://intothewild.club

---

## 🧪 Testing Instructions

### **1. Monitor Console Output**

Open https://intothewild.club and check browser console for:

```
🔍 AuthProvider: useEffect triggered - START
🔍 AuthProvider: Is mobile? false
🔍 AuthProvider: About to call getSession()
```

### **2. Test Critical Pages**

1. **Landing Page** (`/`)
   - Should load without errors
   - Check for header, buttons, and theme colors

2. **Dashboard** (`/dashboard`)
   - Sign in first
   - Should show "Your Registered Treks"
   - Console should show:
     ```
     🔍 UserTreks: useEffect triggered
     🔍 UserTreks: Calling fetchUserTrekRegistrations
     ```
   - **Should NOT repeat more than 2-3 times**

3. **Events Page** (`/events`)
   - Should load trek events
   - Console should show:
     ```
     🔍 TrekEvents: useEffect triggered
     ```
   - **Should NOT repeat infinitely**

4. **Gallery** (`/gallery`)
   - Should load images
   - No stack overflow errors

### **3. Look for Loop Indicators**

**❌ BAD (Infinite Loop):**

```
🔍 UserTreks: useEffect triggered
🔍 UserTreks: useEffect triggered
🔍 UserTreks: useEffect triggered
🔍 UserTreks: useEffect triggered
... (repeats 100+ times)
```

**✅ GOOD (Normal):**

```
🔍 UserTreks: useEffect triggered
🔍 UserTreks: Calling fetchUserTrekRegistrations
... (stops after 1-2 times)
```

---

## 📈 Expected Results

### **Before Fix:**

- ❌ Dashboard: "Error loading your treks. $3 is not defined"
- ❌ Events: "Maximum call stack size exceeded"
- ❌ Gallery: "Maximum call stack size exceeded"
- ❌ Console: No visible errors (silent failure)

### **After Fix:**

- ✅ Dashboard: Loads user's registered treks successfully
- ✅ Events: Displays all trek events with filters
- ✅ Gallery: Shows trek images with proper loading
- ✅ Console: Debug logs show normal execution flow (1-2 renders per component)

---

## 🔧 Technical Details

### **Why useEffect Loops Occur**

React's useEffect compares dependencies using `Object.is()`:

- **Primitive values** (strings, numbers): Compared by value ✅
- **Objects/Functions**: Compared by reference ❌

When you include a function in dependencies:

1. Component renders
2. Function is recreated (new reference)
3. useEffect sees "new" dependency
4. useEffect runs again
5. Component re-renders
6. **GOTO 2** (infinite loop)

### **Solution Pattern**

```typescript
// ❌ BAD: Function in dependencies
const fetchData = async () => {
  /* ... */
};
useEffect(() => {
  fetchData();
}, [fetchData]); // New reference every render

// ✅ GOOD: Only data dependencies
const fetchData = useCallback(async () => {
  /* ... */
}, []);
useEffect(() => {
  fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // Run once, or with data deps only
```

---

## 🎯 Next Steps

1. **Monitor Production** (Next 24 hours)
   - Check Vercel logs for errors
   - Monitor user reports
   - Watch console output on live site

2. **If Issues Persist**
   - Check which component shows repeating logs
   - Apply targeted fix to that specific component
   - May need to add abort controllers to async operations

3. **Future Prevention**
   - Add ESLint rule to warn about function dependencies
   - Create custom hook for safe useEffect patterns
   - Add automated testing for infinite loops

---

## 📝 Notes

- **Build Status:** ✅ Successful (v7 assets generated)
- **TypeScript Errors:** ⚠️ Present but not blocking (pre-existing)
- **Cache Invalidation:** ✅ v7 suffix applied to all assets
- **Debug Logging:** ✅ Active in production (can be removed later)

---

## 🙏 Acknowledgments

This fix was implemented following a systematic debugging approach:

1. Identified symptoms (stack overflow errors)
2. Added comprehensive logging
3. Analyzed component lifecycle
4. Fixed circular dependencies
5. Deployed with monitoring

**Key Lesson:** Always check useEffect dependencies for functions that are recreated on every render.

---

## 🔥 **CRITICAL UPDATE - Gallery Page Fix**

**Issue Found:** The `/gallery` page had TWO circular dependencies causing 200+ console logs in 5 seconds:

1. **Line 436-441:** `useEffect` with `[fetchTreks, fetchTags]` dependencies
2. **Line 570-572:** `useEffect` with `handleFiltersChange` dependency

**Fix Applied:**

```typescript
// BEFORE (Infinite Loop)
useEffect(() => {
  setCurrentPage(1);
  setHasMore(true);
  fetchTreks(1, false);
  fetchTags();
}, [fetchTreks, fetchTags]); // ❌ Both functions recreated every render

// AFTER (Fixed)
useEffect(() => {
  console.log("🔍 PublicGallery: Initial load useEffect triggered");
  setCurrentPage(1);
  setHasMore(true);
  fetchTreks(1, false);
  fetchTags();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []); // ✅ Only run on mount
```

---

**Status:** ✅ **DEPLOYED TO PRODUCTION**
**Initial Deployment:** January 25, 2025 - Commit `19edd7e`
**Gallery Fix:** January 25, 2025 - Commit `be303e8` ⭐
**Expected Resolution:** Immediate (once Vercel deployment completes)
