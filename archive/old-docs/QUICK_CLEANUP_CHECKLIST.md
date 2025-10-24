# ⚡ Quick Pre-Deployment Checklist

## 🔴 CRITICAL (Must Do Now)

### 1. Console Logs Cleanup

```bash
# Count current console.logs
grep -rn "console\.log" src/ | wc -l
# Expected: 123 matches

# Find all files
grep -rl "console\.log" src/
```

**Files to Fix:** 37 files  
**Priority Files:**

- [ ] src/components/trek/create/TrekFormWizard.tsx (7 logs)
- [ ] src/hooks/useExpenseSplitting.ts (7 logs)
- [ ] src/pages/TrekEvents.tsx (8 logs)
- [ ] src/hooks/useTrekCommunity.ts (7 logs)
- [ ] src/pages/AdminPanel.tsx (4 logs)
- [ ] src/components/trek/TentRental.tsx (4 logs)

**Action:** Replace with proper error handling or remove

---

### 2. Delete Redundant Files

```bash
# Check if files exist first
ls -la src/integrations/supabase/types.tsnpx
ls -la src/into-the-wild.code-workspace
ls -la src/components/trek/CreateTrekMultiStepForm.tsx
```

**Delete List:**

- [ ] `src/integrations/supabase/types.tsnpx` (duplicate types)
- [ ] `src/into-the-wild.code-workspace` (misplaced)
- [ ] `src/components/trek/CreateTrekMultiStepForm.tsx` (old version)

---

### 3. Update .gitignore

Add these entries:

```gitignore
# Environment files
.env
.env.local
.env.development
.env.production
.env*.local

# Database
*.db
*.sqlite

# Build artifacts
tsconfig.tsbuildinfo

# VS Code
*.code-workspace

# Temp
.temp/
```

- [ ] Add environment files
- [ ] Add build artifacts
- [ ] Add workspace files

---

## 🟠 HIGH PRIORITY (This Week)

### 4. Remove Archive Folders

**Before deletion - BACKUP FIRST!**

```bash
# Option 1: Create backup
tar -czf database-archive-backup-$(date +%Y%m%d).tar.gz database-archive/

# Option 2: Just delete (if already backed up)
# rm -rf database-archive/
# rm -rf db/
```

- [ ] Backup `database-archive/` folder
- [ ] Delete `database-archive/` (after backup)
- [ ] Delete `db/` folder (verify no active migrations)
- [ ] Remove `dist/` from git tracking

---

### 5. Build & Test

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Run linter
npm run lint

# Run tests
npm test

# Build production
npm run build

# Check build size
du -sh dist/
```

- [ ] Clean install dependencies
- [ ] No linter errors
- [ ] All tests pass
- [ ] Production build succeeds
- [ ] Build size < 500KB gzipped

---

## 🟡 MEDIUM PRIORITY (Before Deploy)

### 6. Environment Setup

- [ ] Copy `env.sample` to `.env`
- [ ] Fill in Supabase credentials
- [ ] Verify all variables in deployment platform
- [ ] Test with production-like env

---

### 7. Security Check

- [ ] No hardcoded secrets in code
- [ ] `.env` files in `.gitignore`
- [ ] Supabase RLS policies active
- [ ] Authentication working properly
- [ ] File upload validation working

---

### 8. Performance Check

```bash
# Build and preview
npm run build
npm run preview
```

- [ ] Lighthouse score > 90
- [ ] First load < 3s
- [ ] No console errors
- [ ] Mobile responsive

---

## 📊 Quick Stats

**Before Cleanup:**

- Console.logs: 123 across 37 files
- Duplicate files: 5
- Archive folders: 2
- Type conflicts: 2

**After Cleanup Target:**

- Console.logs: 0 in production
- Duplicate files: 0
- Archive folders: 0
- Type conflicts: 0

---

## 🚀 One-Line Quick Fixes

```bash
# Remove duplicate type file
rm src/integrations/supabase/types.tsnpx

# Remove misplaced workspace
rm src/into-the-wild.code-workspace

# Remove old form component
rm src/components/trek/CreateTrekMultiStepForm.tsx

# Remove dist from git (keep local)
git rm -r --cached dist/

# Count remaining console.logs
grep -rn "console\.log" src/ | wc -l
```

---

## ✅ Deployment Readiness

**Ready to deploy when:**

- [x] All CRITICAL items completed
- [x] All HIGH PRIORITY items completed
- [x] Build succeeds without errors
- [x] All tests passing
- [x] Environment variables configured
- [x] No sensitive data in repo
- [x] Backup strategy in place

**Current Status:** 🟡 IN PROGRESS

---

## 📅 Timeline

| Phase               | Duration     | Status     |
| ------------------- | ------------ | ---------- |
| Console.log cleanup | 2-3 hours    | ⏳ Pending |
| File deletions      | 30 minutes   | ⏳ Pending |
| Archive cleanup     | 30 minutes   | ⏳ Pending |
| Testing             | 2 hours      | ⏳ Pending |
| **TOTAL**           | **~6 hours** | ⏳ Pending |

---

## 🆘 Emergency Rollback

If issues arise after cleanup:

```bash
# Restore from git
git checkout HEAD -- .

# Or restore specific file
git checkout HEAD -- <filename>
```

Keep this checklist updated as you progress! ✨
