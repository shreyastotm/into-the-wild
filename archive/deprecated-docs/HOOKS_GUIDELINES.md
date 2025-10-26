# 🪝 React Hooks Guidelines - Into the Wild

## Overview

This document establishes coding standards and best practices for React hooks in the Into the Wild project. These guidelines prevent infinite loops, performance issues, and ensure consistent behavior across all pages.

---

## 🎯 Core Principles

### 1. **Prevent Infinite Loops**
The primary goal is to avoid dependency cycles between `useEffect` and `useCallback` hooks.

### 2. **Performance First**
Memoize expensive operations but avoid unnecessary dependencies.

### 3. **Predictable Behavior**
Ensure hooks behave consistently across renders and user interactions.

---

## ✅ Correct Patterns

### Pattern 1: Empty Dependencies with Stale Closure (Recommended)

```typescript
const fetchData = useCallback(async (param: string) => {
  // ✅ Read current state inside function (stale closure)
  const currentFilter = filterState;
  const currentSort = sortBy;

  // Make API call using current values
  const result = await api.get(`/data?filter=${currentFilter}&sort=${currentSort}`);
  setData(result);
}, []); // ✅ Empty dependencies

useEffect(() => {
  fetchData('initial');
}, [fetchData]); // ❌ This still creates a loop if fetchData depends on state
```

**Use When:** Function doesn't depend on changing state values.

**Example in codebase:** `PublicGallery.tsx` fetchTreks function.

---

### Pattern 2: Primitive Dependencies Only

```typescript
const [searchTerm, setSearchTerm] = useState('');
const [sortBy, setSortBy] = useState('date');

const fetchData = useCallback(async () => {
  await api.get(`/data?search=${searchTerm}&sort=${sortBy}`);
}, [searchTerm, sortBy]); // ✅ Only primitive values

useEffect(() => {
  fetchData();
}, [searchTerm, sortBy]); // ✅ Only primitive values
```

**Use When:** Function depends on specific primitive state values.

**Example in codebase:** `TrekEvents.tsx` filter handling.

---

### Pattern 3: Object Length Instead of Object Reference

```typescript
const [selectedTags, setSelectedTags] = useState<number[]>([]);

useEffect(() => {
  fetchData();
}, [selectedTags.length]); // ✅ Use .length instead of array reference

// ❌ DON'T DO THIS:
// useEffect(() => { fetchData(); }, [selectedTags]);
```

**Use When:** Need to react to array/object changes without dependency loops.

**Example in codebase:** `PublicGallery.tsx` tag filtering.

---

## ❌ Anti-Patterns (Never Use)

### Anti-Pattern 1: Function in Dependencies

```typescript
// ❌ NEVER DO THIS - Creates infinite loops
const fetchData = useCallback(async () => {
  // ... fetch logic
}, [someState]);

useEffect(() => {
  fetchData(); // This calls the function
}, [fetchData]); // ❌ Function reference in dependencies

// Result: someState changes → fetchData recreated → useEffect triggers → fetchData called → loop
```

### Anti-Pattern 2: Object References in Dependencies

```typescript
const [filterOptions, setFilterOptions] = useState({
  search: '',
  category: '',
  sortBy: 'date'
});

// ❌ DON'T DO THIS:
useEffect(() => {
  fetchData();
}, [filterOptions]); // Object reference changes on every render

// ✅ DO THIS INSTEAD:
useEffect(() => {
  fetchData();
}, [filterOptions.search, filterOptions.category, filterOptions.sortBy]);
```

### Anti-Pattern 3: Callback Depending on Callback

```typescript
// ❌ NEVER DO THIS:
const helper = useCallback(() => { /* logic */ }, []);
const fetchData = useCallback(async () => {
  await helper(); // Calls helper
}, [helper]); // Depends on helper

// If helper changes, fetchData recreates, creating potential loops
```

---

## 📋 Page-Specific Implementations

### Dashboard.tsx ✅ SAFE
- Uses proper hook ordering (all hooks before early returns)
- Event listeners properly throttled
- No complex data fetching patterns

### TrekEvents.tsx ✅ SAFE
- fetchEvents has empty dependencies
- useEffect depends on individual filter properties
- No circular dependencies

### PublicGallery.tsx ⚠️ SAFE (Documented)
- Uses stale closure pattern (intentionally)
- Documented in comments
- Safe but could be confusing without documentation

### TrekEventsAdmin.tsx ✅ FIXED
- Removed unnecessary fetchTrekMedia dependency
- Now uses empty dependencies correctly

---

## 🔧 Common Fixes

### Fix 1: Remove Function Dependencies

**Before:**
```typescript
const fetchData = useCallback(async () => {
  await helperFunction();
}, [helperFunction]);

useEffect(() => {
  fetchData();
}, [fetchData]);
```

**After:**
```typescript
const fetchData = useCallback(async () => {
  await helperFunction(); // Call directly
}, []); // Remove dependency

useEffect(() => {
  fetchData();
}, []); // Or use primitive dependencies
```

### Fix 2: Use Primitive Dependencies

**Before:**
```typescript
const [options, setOptions] = useState({ search: '', sort: '' });
useEffect(() => { /* ... */ }, [options]);
```

**After:**
```typescript
const [search, setSearch] = useState('');
const [sort, setSort] = useState('');
useEffect(() => { /* ... */ }, [search, sort]);
```

### Fix 3: Document Stale Closures

**Before:**
```typescript
const fetchData = useCallback(async () => {
  const currentFilter = filterState; // Why are we doing this?
  // ...
}, []);
```

**After:**
```typescript
const fetchData = useCallback(async () => {
  // ✅ INTENTIONAL STALE CLOSURE:
  // Reading current state inside function prevents dependency loops
  // Safe because this function is only called from controlled contexts
  const currentFilter = filterState;
  // ...
}, []);
```

---

## 🧪 Testing Checklist

Before committing changes involving hooks:

1. **No Console Errors:**
   ```bash
   # Check for React warnings about hook order or dependencies
   npm run dev
   # Change filters rapidly - no infinite loops should occur
   ```

2. **Performance Stable:**
   ```bash
   # No repeated network requests when changing filters
   # Page remains responsive during filter changes
   ```

3. **State Consistency:**
   ```bash
   # Filters work as expected
   # No stale data issues
   # UI updates correctly
   ```

---

## 🚨 Emergency Fixes

If you encounter infinite loops:

1. **Immediate Fix:** Add `// eslint-disable-next-line react-hooks/exhaustive-deps` temporarily
2. **Root Cause:** Identify the dependency cycle
3. **Long-term:** Refactor to use correct pattern above

---

## 📚 Further Reading

- [React Hooks Rules](https://reactjs.org/docs/hooks-rules.html)
- [useCallback and useMemo](https://react.dev/reference/react/useCallback)
- [Infinite Loops in React](https://overreacted.io/a-complete-guide-to-useeffect/)

---

## 🤝 Contributing

When adding new hooks or modifying existing ones:

1. Check this guide first
2. Test for infinite loops
3. Add comments explaining non-obvious patterns
4. Update this document if new patterns are established

---

*Last updated: October 2025*
