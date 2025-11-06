-- Database Cleanup Suggestions
-- Generated: 2025-11-06T14:13:20.489Z
-- ⚠️  REVIEW CAREFULLY BEFORE EXECUTING
-- ⚠️  BACKUP DATABASE BEFORE RUNNING

BEGIN;

-- ====================================================================
-- POTENTIALLY UNUSED TABLES (REVIEW BEFORE DROPPING)
-- ====================================================================

-- Table: comments
-- Usage Count: 0
-- Files: None
-- DROP TABLE IF EXISTS public.comments CASCADE;

-- Table: community_posts
-- Usage Count: 0
-- Files: None
-- DROP TABLE IF EXISTS public.community_posts CASCADE;

-- Table: forum_tags
-- Usage Count: 0
-- Files: None
-- DROP TABLE IF EXISTS public.forum_tags CASCADE;

-- Table: image_tag_assignments
-- Usage Count: 0
-- Files: None
-- DROP TABLE IF EXISTS public.image_tag_assignments CASCADE;

-- Table: subscriptions_billing
-- Usage Count: 0
-- Files: None
-- DROP TABLE IF EXISTS public.subscriptions_billing CASCADE;

-- Table: toast_sessions
-- Usage Count: 0
-- Files: None
-- DROP TABLE IF EXISTS public.toast_sessions CASCADE;

-- Table: user_actions
-- Usage Count: 0
-- Files: None
-- DROP TABLE IF EXISTS public.user_actions CASCADE;

-- Table: votes
-- Usage Count: 0
-- Files: None
-- DROP TABLE IF EXISTS public.votes CASCADE;


-- ====================================================================
-- ORPHANED MIGRATIONS (CAN BE ARCHIVED)
-- ====================================================================

-- _archived_conflicts\20250125000001_fix_id_proof_upload_system.sql - Can be archived
-- _archived_conflicts\20251026023626_fix_id_proof_rls_remote.sql - Can be archived
-- _archived_conflicts\20251226000000_fix_registration_id_proofs_rls.sql - Can be archived
-- _archived_conflicts\20251226010000_fix_id_proof_rls_remote.sql - Can be archived
-- _archived_conflicts\20251226020000_fix_id_proof_rls_final.sql - Can be archived
-- _archived_conflicts\apply_remote_policies.sql - Can be archived
-- _archived_conflicts\check_remote_policies.sql - Can be archived
-- _archived_conflicts\check_rls_policies.sql - Can be archived
-- _archived_conflicts\direct_rls_fix.sql - Can be archived
-- _archived_conflicts\fix_id_proof_rls.sql - Can be archived
-- _archived_conflicts\fix_rls_direct.sql - Can be archived
-- _archived_conflicts\fix_rls_simplified.sql - Can be archived
-- _archived_conflicts\fix_storage_rls.sql - Can be archived
-- _archived_conflicts\update_rls_policies.sql - Can be archived
-- REMOTE_APPLY_user_posts.sql - Can be archived
-- REMOTE_APPLY_user_connections.sql - Can be archived
-- REMOTE_APPLY_trek_event_tags.sql - Can be archived
-- REMOTE_APPLY_profile_milestones.sql - Can be archived
-- REMOTE_APPLY_profile_completion.sql - Can be archived

-- ROLLBACK; -- Uncomment to rollback if needed
COMMIT;
