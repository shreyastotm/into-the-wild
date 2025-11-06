# Database Cleanup Report

Generated: 2025-11-06T14:16:47.707Z

## Summary

- **Unused Tables**: 8
- **Orphaned Migrations**: 0

## Unused Tables

### comments
- **Usage Count**: 0
- **Status**: ❌ Unused
- **Files**: None

### community_posts
- **Usage Count**: 0
- **Status**: ❌ Unused
- **Files**: None

### forum_tags
- **Usage Count**: 0
- **Status**: ❌ Unused
- **Files**: None

### image_tag_assignments
- **Usage Count**: 0
- **Status**: ❌ Unused
- **Files**: None

### subscriptions_billing
- **Usage Count**: 0
- **Status**: ❌ Unused
- **Files**: None

### toast_sessions
- **Usage Count**: 0
- **Status**: ❌ Unused
- **Files**: None

### user_actions
- **Usage Count**: 0
- **Status**: ❌ Unused
- **Files**: None

### votes
- **Usage Count**: 0
- **Status**: ❌ Unused
- **Files**: None


## Orphaned Migrations

✅ No orphaned migrations found

## Recommendations

⚠️  Found 8 potentially unused tables. Review before deletion:
   - comments (0 usages found)
   - community_posts (0 usages found)
   - forum_tags (0 usages found)
   - image_tag_assignments (0 usages found)
   - subscriptions_billing (0 usages found)
   - toast_sessions (0 usages found)
   - user_actions (0 usages found)
   - votes (0 usages found)

   💡 Before deleting, verify:
   1. Check if tables are used in Supabase Edge Functions
   2. Verify if tables are accessed via direct SQL
   3. Check if tables are part of future features

## Next Steps

1. Review unused tables carefully before deletion
2. Archive orphaned migrations
3. Verify tables are not used in Edge Functions
4. Check for future feature dependencies
