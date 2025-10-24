# Forum Category Tags Implementation Fix

## Issues Fixed

### 1. RPC Function Column Ambiguity (400 Error)

**Problem:** The `create_forum_thread_with_tags` RPC function was returning an ambiguous column reference error because variables `v_thread_id` and `v_post_id` conflicted with column names.

**Fix Applied in `supabase/migrations/20250120000008_forum_tags_rpc.sql`:**

```sql
-- Line 95: Added aliases to resolve ambiguity
RETURN QUERY SELECT v_thread_id AS thread_id, v_post_id AS post_id;
```

### 2. Category Page Missing Tag Selection

**Problem:** The `/forum/c/{slug}` category page didn't have tag selection functionality, causing threads created from there to fail validation (requires at least one tag).

**Fixes Applied in `src/pages/forum/Category.tsx`:**

#### Added Imports:

```typescript
import { Tag as TagIcon, X } from "lucide-react";
import { Label } from "@/components/ui/label";
```

#### Added Interface:

```typescript
interface ForumTag {
  id: number;
  name: string;
  slug: string;
  color: string;
  sort_order: number;
}
```

#### Added State Variables:

```typescript
const [tags, setTags] = useState<ForumTag[]>([]);
const [selectedTagIds, setSelectedTagIds] = useState<number[]>([]);
```

#### Updated fetchCategoryData:

- Added call to `supabase.rpc('get_forum_tags')` to fetch available tags
- Stored tags in state

#### Updated handleCreateThread:

- Changed from `create_forum_thread` to `create_forum_thread_with_tags` RPC
- Added validation for tag selection (at least one required)
- Added `p_tag_ids` parameter to RPC call
- Reset `selectedTagIds` on successful creation
- Navigate to new thread on success

#### Added toggleTag Function:

```typescript
const toggleTag = (tagId: number) => {
  setSelectedTagIds((prev) => {
    if (prev.includes(tagId)) {
      return prev.filter((id) => id !== tagId);
    } else {
      return [...prev, tagId];
    }
  });
};
```

#### Updated Create Thread Dialog UI:

- Added tag selection section at the top
- Tags displayed as colored badges (clickable)
- Shows selected tag count
- Updated validation to require tags
- Changed "Initial Post (Optional)" to required field with validation

## Summary of Changes

### Database Migration:

- `supabase/migrations/20250120000008_forum_tags_rpc.sql` (MODIFIED)
  - Fixed column ambiguity in `create_forum_thread_with_tags` return statement

### Frontend:

- `src/pages/forum/Category.tsx` (MODIFIED)
  - Added tag selection UI
  - Updated to use `create_forum_thread_with_tags` RPC
  - Added tag validation
  - Improved user feedback

## Testing Checklist

- [ ] Run migration 008 in Supabase dashboard (should succeed now)
- [ ] Navigate to `/forum/c/{category-slug}`
- [ ] Click "New Thread" button
- [ ] Verify tags are displayed in the dialog
- [ ] Select at least one tag
- [ ] Fill in title and content
- [ ] Create thread (should succeed)
- [ ] Verify thread is created with selected tags
- [ ] Test from main `/forum` page (should still work)

## Files Modified

1. `supabase/migrations/20250120000008_forum_tags_rpc.sql`
2. `src/pages/forum/Category.tsx`

## Status

✅ RPC function column ambiguity fixed
✅ Category page tag selection implemented
✅ Consistent behavior across forum pages
✅ Ready for testing
