# Migration Consolidation Report

Generated: 2025-11-06T14:16:12.722Z

## Summary

- **Total Migrations**: 110
- **Active Migrations**: 8
- **Archived Migrations**: 97
- **Conflict Migrations**: 14
- **Remote Apply Migrations**: 5
- **Duplicate Groups**: 19

## Active Migrations

- `20250203000000_fix_trek_assets_bucket.sql` (20250203000000)
- `20260101000000_comprehensive_schema_consolidation.sql` (20260101000000)
- `20260115000000_trek_event_tags_system.sql` (20260115000000)
- `20260201000000_phase5_interaction_system.sql` (20260201000000)
- `20260202000000_add_profile_completion_table.sql` (20260202000000)
- `20260202000001_add_profile_milestones_table.sql` (20260202000001)
- `20260202000002_add_user_connections_table.sql` (20260202000002)
- `20260202000003_add_user_posts_table.sql` (20260202000003)

## Archived Migrations

- `update_rls_policies.sql`
- `fix_storage_rls.sql`
- `fix_rls_simplified.sql`
- `fix_rls_direct.sql`
- `fix_id_proof_rls.sql`
- `direct_rls_fix.sql`
- `check_rls_policies.sql`
- `check_remote_policies.sql`
- `apply_remote_policies.sql`
- `20251226020000_fix_id_proof_rls_final.sql`
- `20251226010000_fix_id_proof_rls_remote.sql`
- `20251226000000_fix_registration_id_proofs_rls.sql`
- `20251026023626_fix_id_proof_rls_remote.sql`
- `20250125000001_fix_id_proof_upload_system.sql`
- `99999999999999_the_one_true_and_final_fix_for_everything.sql`
- `99999999999998_fix_trek_registrations_foreign_key.sql`
- `20260201000000_phase5_interaction_system.sql`
- `20260130000000_add_jam_yard_event_type.sql`
- `20251227000000_master_id_proof_rls_fix.sql`
- `20251008000000_add_registrant_details_to_trek_registrations.sql`
- `20251007090000_site_settings.sql`
- `20250615000003_add_tent_reserved_count_function.sql`
- `20250615000002_add_tent_rentals.sql`
- `20250615000001_add_event_types_support.sql`
- `20250614000006_add_pay_by_date_to_trek_costs.sql`
- `20250614000005_fix_authentication_conflicts.sql`
- `20250614000003_fix_trek_costs_rls_policies.sql`
- `20250614000002_verify_trek_costs_table.sql`
- `20250614000001_add_master_packing_items.sql`
- `20250614000000_create_trek_costs_table.sql`
- `20250613000010_add_missing_auth_policies.sql`
- `20250613000009_restore_auth_and_verification.sql`
- `20250611000000_final_fixes.sql`
- `20250610160000_create_votes_table.sql`
- `20250610140000_create_user_sync_trigger_and_function.sql`
- `20250610130000_create_trek_packing_items.sql`
- `20250610120000_add_rls_policies_for_users.sql`
- `20250610115900_create_is_admin_function.sql`
- `20250610110000_correct_user_upsert_logic.sql`
- `20250609200000_fix_handle_new_user_logic.sql`
- `20250609190000_add_payment_proof_url_to_registrations.sql`
- `20250609120000_create_storage_bucket.sql`
- `20250609110000_add_on_update_cascade_to_trek_events_partner_id.sql`
- `20250609100000_make_handle_new_user_idempotent.sql`
- `20250608180000_add_insert_policy_for_users.sql`
- `20250608170812_add_indemnity_agreed_at_to_registrations.sql`
- `20250608160633_add_indemnity_agreed_at_to_registrations.sql`
- `20250505155504_rpc_get_trek_participant_count.sql`
- `20250505155503_create_notification_rpc.sql`
- `20250505155502_create_notifications.sql`
- `20250125000003_fix_trek_participant_count_function.sql`
- `20250125000002_create_trek_participant_count_function.sql`
- `20250125000000_fix_public_gallery_access.sql`
- `20250124000000_create_image_tags_system.sql`
- `20250123000000_upgrade_trek_media_limits.sql`
- `20250122000000_create_user_trek_images_table.sql`
- `20250120000008_forum_tags_rpc.sql`
- `20250120000007_forum_tags_system.sql`
- `20250120000006_create_indexes.sql`
- `20250120000005_forum_rate_limiting.sql`
- `20250120000004_seed_avatar_catalog.sql`
- `20250120000003_avatar_rpc_functions.sql`
- `20250120000002_avatar_and_forum_rls.sql`
- `20250120000001_avatar_users_linkage.sql`
- `20250120000000_avatar_and_forum_schema.sql`
- `20250119000002_migrate_fixed_costs_data.sql`
- `20250119000001_auto_verify_all_users.sql`
- `20250118000004_fix_cost_type_constraint.sql`
- `20250118000003_apply_government_id_required.sql`
- `20250118000002_create_id_verification_system.sql`
- `20250118000001_add_government_id_required.sql`
- `20250115000002_fix_users_rls_no_recursion.sql`
- `20250115000001_fix_rls_infinite_recursion.sql`
- `20250115000000_comprehensive_signup_fix.sql`
- `20250112000000_fix_schema_drift.sql`
- `20250111000000_ensure_trek_drivers_columns.sql`
- `20250104000000_final_production_fixes.sql`
- `00000000000000_squashed_schema.sql`
- `REMOTE_APPLY_user_posts.sql`
- `REMOTE_APPLY_user_connections.sql`
- `REMOTE_APPLY_trek_event_tags.sql`
- `REMOTE_APPLY_profile_milestones.sql`
- `REMOTE_APPLY_profile_completion.sql`
- `update_rls_policies.sql`
- `fix_storage_rls.sql`
- `fix_rls_simplified.sql`
- `fix_rls_direct.sql`
- `fix_id_proof_rls.sql`
- `direct_rls_fix.sql`
- `check_rls_policies.sql`
- `check_remote_policies.sql`
- `apply_remote_policies.sql`
- `20251226020000_fix_id_proof_rls_final.sql`
- `20251226010000_fix_id_proof_rls_remote.sql`
- `20251226000000_fix_registration_id_proofs_rls.sql`
- `20251026023626_fix_id_proof_rls_remote.sql`
- `20250125000001_fix_id_proof_upload_system.sql`

## Conflict Migrations

- `update_rls_policies.sql`
- `fix_storage_rls.sql`
- `fix_rls_simplified.sql`
- `fix_rls_direct.sql`
- `fix_id_proof_rls.sql`
- `direct_rls_fix.sql`
- `check_rls_policies.sql`
- `check_remote_policies.sql`
- `apply_remote_policies.sql`
- `20251226020000_fix_id_proof_rls_final.sql`
- `20251226010000_fix_id_proof_rls_remote.sql`
- `20251226000000_fix_registration_id_proofs_rls.sql`
- `20251026023626_fix_id_proof_rls_remote.sql`
- `20250125000001_fix_id_proof_upload_system.sql`

## Remote Apply Migrations

- `REMOTE_APPLY_user_posts.sql`
- `REMOTE_APPLY_user_connections.sql`
- `REMOTE_APPLY_trek_event_tags.sql`
- `REMOTE_APPLY_profile_milestones.sql`
- `REMOTE_APPLY_profile_completion.sql`

## Duplicate Migrations

### Group 1
- `REMOTE_APPLY_user_posts.sql`
- `_archived_consolidated\remote-apply\2025-11-06\REMOTE_APPLY_user_posts.sql`

### Group 2
- `REMOTE_APPLY_user_connections.sql`
- `_archived_consolidated\remote-apply\2025-11-06\REMOTE_APPLY_user_connections.sql`

### Group 3
- `REMOTE_APPLY_trek_event_tags.sql`
- `_archived_consolidated\remote-apply\2025-11-06\REMOTE_APPLY_trek_event_tags.sql`

### Group 4
- `REMOTE_APPLY_profile_milestones.sql`
- `_archived_consolidated\remote-apply\2025-11-06\REMOTE_APPLY_profile_milestones.sql`

### Group 5
- `REMOTE_APPLY_profile_completion.sql`
- `_archived_consolidated\remote-apply\2025-11-06\REMOTE_APPLY_profile_completion.sql`

### Group 6
- `_archived_conflicts\update_rls_policies.sql`
- `_archived_consolidated\conflicts\2025-11-06\update_rls_policies.sql`

### Group 7
- `_archived_conflicts\fix_storage_rls.sql`
- `_archived_consolidated\conflicts\2025-11-06\fix_storage_rls.sql`

### Group 8
- `_archived_conflicts\fix_rls_simplified.sql`
- `_archived_consolidated\conflicts\2025-11-06\fix_rls_simplified.sql`

### Group 9
- `_archived_conflicts\fix_rls_direct.sql`
- `_archived_consolidated\conflicts\2025-11-06\fix_rls_direct.sql`

### Group 10
- `_archived_conflicts\fix_id_proof_rls.sql`
- `_archived_consolidated\conflicts\2025-11-06\fix_id_proof_rls.sql`

### Group 11
- `_archived_conflicts\direct_rls_fix.sql`
- `_archived_consolidated\conflicts\2025-11-06\direct_rls_fix.sql`

### Group 12
- `_archived_conflicts\check_rls_policies.sql`
- `_archived_consolidated\conflicts\2025-11-06\check_rls_policies.sql`

### Group 13
- `_archived_conflicts\check_remote_policies.sql`
- `_archived_consolidated\conflicts\2025-11-06\check_remote_policies.sql`

### Group 14
- `_archived_conflicts\apply_remote_policies.sql`
- `_archived_consolidated\conflicts\2025-11-06\apply_remote_policies.sql`

### Group 15
- `_archived_conflicts\20251226020000_fix_id_proof_rls_final.sql`
- `_archived_consolidated\conflicts\2025-11-06\20251226020000_fix_id_proof_rls_final.sql`

### Group 16
- `_archived_conflicts\20251226010000_fix_id_proof_rls_remote.sql`
- `_archived_consolidated\conflicts\2025-11-06\20251226010000_fix_id_proof_rls_remote.sql`

### Group 17
- `_archived_conflicts\20251226000000_fix_registration_id_proofs_rls.sql`
- `_archived_consolidated\conflicts\2025-11-06\20251226000000_fix_registration_id_proofs_rls.sql`

### Group 18
- `_archived_conflicts\20251026023626_fix_id_proof_rls_remote.sql`
- `_archived_consolidated\conflicts\2025-11-06\20251026023626_fix_id_proof_rls_remote.sql`

### Group 19
- `_archived_conflicts\20250125000001_fix_id_proof_upload_system.sql`
- `_archived_consolidated\conflicts\2025-11-06\20250125000001_fix_id_proof_upload_system.sql`

## Recommendations

📋 Migration Consolidation Recommendations:

✅ Active Migrations: 8
   These are the current migrations in use. Keep these.

📦 Archived Migrations: 97
   These are already archived. Can be moved to permanent archive.

⚠️  Conflict Migrations: 14
   These need to be resolved. Review and merge if needed, then archive.

🔄 Remote Apply Migrations: 5
   These are temporary files. Can be removed after remote application.

🔁 Duplicate Migrations: 19 groups
   Group 1:
     - REMOTE_APPLY_user_posts.sql
     - _archived_consolidated\remote-apply\2025-11-06\REMOTE_APPLY_user_posts.sql
   Group 2:
     - REMOTE_APPLY_user_connections.sql
     - _archived_consolidated\remote-apply\2025-11-06\REMOTE_APPLY_user_connections.sql
   Group 3:
     - REMOTE_APPLY_trek_event_tags.sql
     - _archived_consolidated\remote-apply\2025-11-06\REMOTE_APPLY_trek_event_tags.sql
   Group 4:
     - REMOTE_APPLY_profile_milestones.sql
     - _archived_consolidated\remote-apply\2025-11-06\REMOTE_APPLY_profile_milestones.sql
   Group 5:
     - REMOTE_APPLY_profile_completion.sql
     - _archived_consolidated\remote-apply\2025-11-06\REMOTE_APPLY_profile_completion.sql
   Group 6:
     - _archived_conflicts\update_rls_policies.sql
     - _archived_consolidated\conflicts\2025-11-06\update_rls_policies.sql
   Group 7:
     - _archived_conflicts\fix_storage_rls.sql
     - _archived_consolidated\conflicts\2025-11-06\fix_storage_rls.sql
   Group 8:
     - _archived_conflicts\fix_rls_simplified.sql
     - _archived_consolidated\conflicts\2025-11-06\fix_rls_simplified.sql
   Group 9:
     - _archived_conflicts\fix_rls_direct.sql
     - _archived_consolidated\conflicts\2025-11-06\fix_rls_direct.sql
   Group 10:
     - _archived_conflicts\fix_id_proof_rls.sql
     - _archived_consolidated\conflicts\2025-11-06\fix_id_proof_rls.sql
   Group 11:
     - _archived_conflicts\direct_rls_fix.sql
     - _archived_consolidated\conflicts\2025-11-06\direct_rls_fix.sql
   Group 12:
     - _archived_conflicts\check_rls_policies.sql
     - _archived_consolidated\conflicts\2025-11-06\check_rls_policies.sql
   Group 13:
     - _archived_conflicts\check_remote_policies.sql
     - _archived_consolidated\conflicts\2025-11-06\check_remote_policies.sql
   Group 14:
     - _archived_conflicts\apply_remote_policies.sql
     - _archived_consolidated\conflicts\2025-11-06\apply_remote_policies.sql
   Group 15:
     - _archived_conflicts\20251226020000_fix_id_proof_rls_final.sql
     - _archived_consolidated\conflicts\2025-11-06\20251226020000_fix_id_proof_rls_final.sql
   Group 16:
     - _archived_conflicts\20251226010000_fix_id_proof_rls_remote.sql
     - _archived_consolidated\conflicts\2025-11-06\20251226010000_fix_id_proof_rls_remote.sql
   Group 17:
     - _archived_conflicts\20251226000000_fix_registration_id_proofs_rls.sql
     - _archived_consolidated\conflicts\2025-11-06\20251226000000_fix_registration_id_proofs_rls.sql
   Group 18:
     - _archived_conflicts\20251026023626_fix_id_proof_rls_remote.sql
     - _archived_consolidated\conflicts\2025-11-06\20251026023626_fix_id_proof_rls_remote.sql
   Group 19:
     - _archived_conflicts\20250125000001_fix_id_proof_upload_system.sql
     - _archived_consolidated\conflicts\2025-11-06\20250125000001_fix_id_proof_upload_system.sql
   Keep the most recent version, archive others.

