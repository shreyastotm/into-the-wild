# 🧹 Cleanup Migration Guide

## **Files Moved/Reorganized**

### **📁 Documentation → `docs/`**
- `README.md` → `docs/README.md`
- `REFACTORING_SUMMARY.md` → `docs/REFACTORING_SUMMARY.md`
- `REFACTORING_PLAN.md` → `docs/REFACTORING_PLAN.md`
- `SECURITY_CHECKLIST.md` → `docs/SECURITY_CHECKLIST.md`
- `user_readme/README.md` → `docs/USER_README.md`

### **🗄️ Database Files → `database-archive/`**
**Debug/Dump Files:**
- `*dump*.sql` (7 files)
- `*debug*.sql` (3 files)
- `trek_debug_checklist.txt`

**Old Migration/Schema Files:**
- `tables.sql`
- `sql_migration*.sql`
- `fix_*.sql`
- `inspect_*.sql`
- `*_data.sql`
- `*migration*.txt`
- `*schema*.sql`
- `role*.sql`
- `restore*.sql`
- `supbase*.sql`
- `scripts/` (entire folder)

### **🗑️ Components Removed**
- `src/components/TrekPackingList.tsx` (duplicate)

## **Component Updates Required**

### **Update Import Paths:**
If you have any imports pointing to the old locations, update them:

```tsx
// OLD - Remove these imports
import TrekPackingList from '@/components/TrekPackingList';

// NEW - Use this instead
import { TrekPackingList } from '@/components/trek/TrekPackingList';
```

### **Replace Old Form Component:**
In `src/pages/admin/TrekEventsAdmin.tsx`:

```tsx
// OLD - Replace this import
import CreateTrekMultiStepForm from '@/components/trek/CreateTrekMultiStepForm';

// NEW - Use this instead
import CreateTrekMultiStepFormNew from '@/components/trek/CreateTrekMultiStepFormNew';

// Then update the component usage
<CreateTrekMultiStepFormNew
  trekToEdit={eventToEdit}
  onFormSubmit={handleFormSubmit}
  onCancel={() => setEditDialogOpen(false)}
  tentInventory={tentInventory}
/>
```

## **Files Now Available in Organized Structure**

```
into-the-wild/
├── docs/                              # All documentation
│   ├── README.md
│   ├── REFACTORING_SUMMARY.md
│   ├── REFACTORING_PLAN.md
│   ├── SECURITY_CHECKLIST.md
│   └── USER_README.md
├── database-archive/                   # Old/debug database files
│   ├── *dump*.sql
│   ├── *debug*.sql
│   ├── old migrations/
│   └── scripts/
├── supabase/                          # Active database
│   └── migrations/                    # Current migrations only
└── src/                               # Clean source code
    └── components/
        ├── auth/                      # Refactored auth components
        └── trek/
            ├── create/                # Modular form components
            ├── CreateTrekMultiStepFormNew.tsx  # New form
            └── TrekPackingList.tsx    # Single packing list component
```

## **Benefits of Cleanup**

### **📊 Storage Reduction**
- **Removed**: ~25 redundant SQL files
- **Archived**: ~15 debug/dump files
- **Organized**: All documentation in one place

### **🎯 Improved Maintainability**
- Clear separation of concerns
- No duplicate components
- Clean migration history
- Organized documentation

### **🚀 Deployment Ready**
- Only essential files in production build
- Clear documentation structure
- Clean database migration path
- No legacy code conflicts

## **Next Steps**

1. **Update Component Imports**: Fix any broken imports
2. **Test Application**: Verify everything still works
3. **Deploy**: Ready for production deployment
4. **Archive**: Can safely delete `database-archive/` after testing
