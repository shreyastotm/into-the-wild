# Production Monitoring Guide - Stack Overflow Fix

## 🎯 Quick Check (5 Minutes)

### **Step 1: Open Production Site**

```
https://intothewild.club
```

### **Step 2: Open Browser DevTools**

- **Chrome/Edge:** Press `F12` or `Ctrl+Shift+I`
- **Firefox:** Press `F12` or `Ctrl+Shift+K`
- Go to **Console** tab

### **Step 3: Navigate Through Pages**

Test in this order:

1. **Landing Page** (already there)
   - Look for: No errors
   - Expected console: Minimal logs

2. **Sign In** (`/auth`)
   - Sign in with your credentials
   - Look for: `🔍 AuthProvider` logs
   - Expected: 1-2 log entries, then stops

3. **Dashboard** (`/dashboard`)
   - Look for: `🔍 UserTreks` logs
   - **CRITICAL CHECK:** Count how many times you see this log
   - ✅ **GOOD:** 1-2 times
   - ❌ **BAD:** 10+ times (infinite loop still present)

4. **Events** (`/events`)
   - Look for: `🔍 TrekEvents` logs
   - Expected: 1-2 times per filter change

5. **Gallery** (`/gallery`)
   - Look for: No stack overflow errors
   - Expected: Images load normally

---

## 🔍 What to Look For

### **✅ Success Indicators**

```
Console Output (Normal):
🔍 AuthProvider: useEffect triggered - START
🔍 AuthProvider: Is mobile? false
🔍 AuthProvider: About to call getSession()
[AUTH] Session check result: { hasSession: true, ... }
🔍 UserTreks: useEffect triggered
🔍 UserTreks: Calling fetchUserTrekRegistrations
[AUTH] Profile fetched successfully: { id: "...", type: "..." }
```

**Key Points:**

- Each log appears 1-2 times maximum
- No repeating patterns
- No error messages
- Pages load successfully

### **❌ Failure Indicators**

```
Console Output (Infinite Loop):
🔍 UserTreks: useEffect triggered
🔍 UserTreks: useEffect triggered
🔍 UserTreks: useEffect triggered
🔍 UserTreks: useEffect triggered
... (repeats 50+ times)
```

**OR**

```
Error Messages:
Uncaught RangeError: Maximum call stack size exceeded
    at <component-name>
```

**Key Points:**

- Same log repeating rapidly
- Browser becomes slow/unresponsive
- "Maximum call stack size exceeded" error
- Pages fail to load

---

## 📊 Detailed Monitoring (15 Minutes)

### **Test 1: Dashboard Load Time**

1. Open DevTools → **Network** tab
2. Navigate to `/dashboard`
3. Check:
   - ✅ Page loads in < 3 seconds
   - ✅ No red (failed) requests
   - ✅ Console shows 1-2 useEffect logs

### **Test 2: Events Filtering**

1. Go to `/events`
2. Change filters (category, price, etc.)
3. Check console after each filter change:
   - ✅ `🔍 TrekEvents: useEffect triggered` appears once per change
   - ✅ No infinite repetition

### **Test 3: Memory Usage**

1. Open DevTools → **Performance** tab
2. Click **Record** (⚫)
3. Navigate through pages for 30 seconds
4. Click **Stop**
5. Check:
   - ✅ Memory usage stays stable (no continuous growth)
   - ✅ No long tasks (yellow bars > 50ms)

---

## 🚨 If Issues Persist

### **Scenario 1: Infinite Loop Still Present**

**Symptoms:**

- Console logs repeat 10+ times
- Browser becomes slow
- "Maximum call stack size exceeded" error

**Action:**

1. Note which component is looping (check the 🔍 logs)
2. Take a screenshot of the console
3. Report back with:
   - Which page has the issue
   - Which component is looping
   - Screenshot of console output

### **Scenario 2: Different Error**

**Symptoms:**

- New error message appears
- Page fails to load
- Unexpected behavior

**Action:**

1. Copy the full error message
2. Note which page/action triggered it
3. Check if it's related to:
   - Network (API calls failing)
   - Permissions (RLS policies)
   - Data (missing fields)

### **Scenario 3: Everything Works!**

**Symptoms:**

- All pages load successfully
- Console shows normal logs (1-2 per component)
- No errors or warnings
- Application is responsive

**Action:**

1. ✅ **SUCCESS!** The fix worked
2. Monitor for 24 hours to ensure stability
3. Consider removing debug logs after confirmation

---

## 📝 Reporting Template

If you need to report an issue, use this format:

```
**Issue Report**

Page: /dashboard
Component: UserTreks
Symptom: Infinite loop

Console Output:
🔍 UserTreks: useEffect triggered
🔍 UserTreks: useEffect triggered
🔍 UserTreks: useEffect triggered
... (repeats 50+ times)

Browser: Chrome 120
Device: Desktop
Time: 2025-01-25 14:30 UTC

Screenshot: [attach]
```

---

## 🎯 Success Criteria

The fix is considered successful if:

1. ✅ All pages load without "Maximum call stack size exceeded" error
2. ✅ Console logs show normal execution (1-2 renders per component)
3. ✅ Dashboard displays user's treks correctly
4. ✅ Events page shows trek list with working filters
5. ✅ Gallery displays images without errors
6. ✅ Application remains responsive during navigation
7. ✅ No memory leaks (stable memory usage over time)

---

## 🔧 Quick Fixes (If Needed)

### **If One Component Still Loops:**

The fix can be applied to any component with this pattern:

```typescript
// Find the problematic useEffect
useEffect(() => {
  someFunction();
}, [dependency1, dependency2, problematicFunction]); // ❌

// Change to:
useEffect(() => {
  someFunction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [dependency1, dependency2]); // ✅ Remove function dependency
```

### **If Multiple Components Loop:**

This indicates a shared hook or context issue. Check:

- `AuthProvider` context value
- Shared hooks like `useAuth`, `useTrek`, etc.
- Ensure all context values are memoized with `useMemo`

---

## 📞 Support

If you encounter any issues:

1. **Check this guide first**
2. **Collect diagnostic information** (console logs, screenshots)
3. **Report with the template above**
4. **Include reproduction steps** (what you clicked, what happened)

---

**Monitoring Period:** Next 24-48 hours
**Expected Outcome:** All issues resolved, application stable
**Next Review:** January 27, 2025
