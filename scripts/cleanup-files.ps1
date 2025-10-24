# Comprehensive Cleanup Script for Into The Wild
# This script moves redundant files to archive folders and deletes unnecessary files

$ErrorActionPreference = "Continue"
$WarningPreference = "Continue"

# Colors for output
function Write-ColorOutput($ForegroundColor) {
    # Save the current color
    $fc = $host.UI.RawUI.ForegroundColor
    
    # Set the new color
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    
    # Write the output
    if ($args) {
        Write-Output $args
    }
    else {
        $input | Write-Output
    }
    
    # Restore the original color
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success($message) {
    Write-ColorOutput Green "[SUCCESS] $message"
}

function Write-Info($message) {
    Write-ColorOutput Cyan "[INFO] $message"
}

function Write-Warning($message) {
    Write-ColorOutput Yellow "[WARNING] $message"
}

function Write-Error($message) {
    Write-ColorOutput Red "[ERROR] $message"
}

function Move-FilesToArchive($files, $destination, $description) {
    Write-Info "Moving $description files to $destination..."
    $movedCount = 0
    
    foreach ($file in $files) {
        if (Test-Path $file) {
            try {
                Move-Item -Path $file -Destination $destination -Force
                $movedCount++
            } catch {
                Write-Warning "Failed to move $file to $destination. Error: $_"
            }
        } else {
            Write-Warning "File not found: $file"
        }
    }
    
    Write-Success "Moved $movedCount $description files to $destination"
}

function Remove-UnnecessaryFiles($files) {
    Write-Info "Removing unnecessary files..."
    $removedCount = 0
    
    foreach ($file in $files) {
        if (Test-Path $file) {
            try {
                Remove-Item -Path $file -Force
                $removedCount++
            } catch {
                Write-Warning "Failed to remove $file. Error: $_"
            }
        } else {
            Write-Warning "File not found: $file"
        }
    }
    
    Write-Success "Removed $removedCount unnecessary files"
}

# Define files to move/delete
$sqlFixFiles = @(
    "BULLETPROOF_DATABASE_FIX.sql",
    "COMPLETE_IMAGE_FIX.sql",
    "COMPREHENSIVE_SIGNUP_FIX.sql",
    "CORRECTED_AUTH_FIX.sql",
    "CORRECTED_SCHEMA_FIX.sql",
    "FINAL_AUTH_FIX.sql",
    "FINAL_CLEANUP_AND_FIX.sql",
    "FINAL_DATABASE_FIX.sql",
    "FINAL_RECURSION_FIX.sql",
    "FINAL_SAFE_RLS_FIX.sql",
    "FINAL_SCHEMA_FIX.sql",
    "FIX_IMAGE_DISPLAY.sql",
    "FIX_RLS_WARNINGS.sql",
    "FIX_SCHEMA_ISSUES.sql",
    "FIX_SIGNUP_FUNCTION.sql",
    "FIX_STORAGE_BUCKETS.sql",
    "MINIMAL_AUTH_FIX.sql",
    "SIMPLE_AUTH_FIX.sql",
    "SIMPLE_CLEANUP_FIX.sql",
    "SIMPLE_DATABASE_FIX.sql",
    "ULTIMATE_DATABASE_FIX.sql",
    "ULTIMATE_RECURSION_FIX.sql",
    "add_government_id_column.sql",
    "assign_default_packing_lists.sql",
    "auto_verify_users.sql",
    "check_current_issues.sql",
    "CHECK_DATABASE_STATUS.sql",
    "check_trek_config.sql",
    "check_users_table_schema.sql",
    "clean_schema.sql",
    "CLEANUP_AUTH_USERS.sql",
    "cleanup_test_treks.sql",
    "CLEAR_ALL_DATA_EXCEPT_ADMIN.sql",
    "create_id_verification_system.sql",
    "create_storage_bucket.sql",
    "create_test_past_treks.sql",
    "CREATE_TREK_ARCHIVE_AND_IMAGES.sql",
    "CREATE_USER_TREK_IMAGES_TABLE.sql",
    "current_schema_dump.sql",
    "current_schema.sql",
    "debug_rls_policies.sql",
    "debug_trek_177_fix.sql",
    "delete_treks_with_registrants.sql",
    "diagnose_auth_issues.sql",
    "diagnose_current_state.sql",
    "fix_missing_id_requirements.sql",
    "fix_packing_list_rls.sql",
    "fix_packing_lists.sql",
    "fix_rls_infinite_recursion.sql",
    "fix_security_warnings.sql",
    "fix_subscription_type_constraint_corrected.sql",
    "fix_subscription_type_constraint.sql",
    "fix_trek_177_mandatory.sql",
    "fix_users_table_schema.sql",
    "FIXED_CLEANUP_AUTH_USERS.sql",
    "get_current_schema.sql",
    "quick_database_fix.sql",
    "QUICK_SIGNUP_FIX.sql",
    "run_database_fixes.sql",
    "SAFE_CLEANUP_AUTH_USERS.sql",
    "SAFE_RLS_FIX.sql",
    "SYNC_EXISTING_USERS.sql",
    "TEMPORARY_DISABLE_RLS.sql",
    "verify_and_fix_database.sql",
    "verify_database_fixed.sql",
    "verify_migration.sql",
    "supabase_migration.sql"
)

$oldDocFiles = @(
    "CLEANUP_MIGRATION.md",
    "DEBUG_422_ERROR.md",
    "DEBUG_SIGNUP_ISSUE.md",
    "DEPLOYMENT_SUCCESS.md",
    "DEPLOYMENT_SUMMARY.md",
    "DEPLOYMENT_v0.2.2_SUMMARY.md",
    "DEPLOYMENT_v0.2.3_SUMMARY.md",
    "DEPLOYMENT_v0.2.9_SUMMARY.md",
    "FORUM_CATEGORY_TAGS_FIX.md",
    "FORUM_TAGS_AND_AVATAR_IMPLEMENTATION.md",
    "FORUM_TAGS_IMPLEMENTATION_COMPLETE.md",
    "GIT_COMMIT_GUIDE.md",
    "HOTFIX_v0.2.3_SUMMARY.md",
    "IMAGE_DISPLAY_FIX_SUMMARY.md",
    "IMPLEMENTATION_COMPLETE.md",
    "IMPLEMENTATION_PROGRESS.md",
    "ISSUES_ANALYSIS_AND_SOLUTIONS.md",
    "MIGRATION_FIXES_007_008.md",
    "PAYMENT_VERIFICATION_WORKFLOW_ENHANCEMENT.md",
    "PRE_DEPLOYMENT_INDEX.md",
    "PRE_DEPLOYMENT_REFACTORING_PLAN.md",
    "QUICK_CLEANUP_CHECKLIST.md",
    "QUICK_START_PAYMENT_VERIFICATION.md",
    "REFACTORING_SUMMARY.md",
    "RELEASE_NOTES_v0.4.2.md",
    "RELEASE_NOTES_v0.4.3.md",
    "RELEASE_NOTES_v0.4.4.md",
    "RELEASE_v0.1.1.md",
    "RELEASE_v0.2.0.md",
    "RELEASE_v0.2.1.md",
    "RELEASE_v0.2.2.md",
    "RELEASE_v0.2.3.md",
    "RELEASE_v0.2.5.md",
    "RELEASE_v0.2.9.md",
    "RELEASE_v0.3.2.md",
    "RLS_FIX_DOCUMENTATION.md",
    "SCHEMA_ISSUES_SUMMARY.md",
    "STORAGE_BUCKET_FIX_SUMMARY.md",
    "TEST_SIGNUP_VALIDATION.md",
    "TEST_SIMPLE_SIGNUP.md",
    "TRAVEL_COORDINATION_FIX.md",
    "TYPESCRIPT_ERROR_FIX_SUMMARY.md",
    "VERCEL_DEPLOYMENT_CHECKLIST.md",
    "VERCEL_DEPLOYMENT_PLAN.md",
    "VERCEL_PROJECT_FIX.md",
    "VERCEL_TROUBLESHOOTING.md",
    "VISUAL_COMPONENTS_CHECKLIST.md",
    "CODEBASE_ANALYSIS_SUMMARY.txt",
    "files-to-remove.txt"
)

$debugFiles = @(
    "check-trek-config.js",
    "debug_supabase_connection.js",
    "debug_supabase.html",
    "debug_test_treks_simple.js",
    "debug-trek-config.html",
    "test_admin_login.html",
    "test_local_fix.html",
    "test_signup.html"
)

$deploymentFiles = @(
    "DEPLOYMENT_SUCCESS.md",
    "DEPLOYMENT_SUMMARY.md",
    "DEPLOYMENT_v0.2.2_SUMMARY.md",
    "DEPLOYMENT_v0.2.3_SUMMARY.md",
    "DEPLOYMENT_v0.2.9_SUMMARY.md",
    "HOTFIX_v0.2.3_SUMMARY.md",
    "RELEASE_v0.1.1.md",
    "RELEASE_v0.2.0.md",
    "RELEASE_v0.2.1.md",
    "RELEASE_v0.2.2.md",
    "RELEASE_v0.2.3.md",
    "RELEASE_v0.2.5.md",
    "RELEASE_v0.2.9.md",
    "RELEASE_v0.3.2.md",
    "VERCEL_DEPLOYMENT_CHECKLIST.md",
    "VERCEL_DEPLOYMENT_PLAN.md",
    "VERCEL_PROJECT_FIX.md",
    "VERCEL_TROUBLESHOOTING.md"
)

$filesToDelete = @(
    "h origin 75e6a476edca9be0835a8571a8cf9420c188ff46main --force",
    "er.name",
    "openjdk-11.zip"
)

# Execute cleanup
Write-Info "Starting comprehensive cleanup..."

# Move SQL fix files
Move-FilesToArchive -files $sqlFixFiles -destination "archive\sql-fixes" -description "SQL fix"

# Move deployment files (these are in oldDocFiles too, but we're moving them to a different location)
Move-FilesToArchive -files $deploymentFiles -destination "archive\deployment-history" -description "deployment"

# Remove deployment files from oldDocFiles to avoid "file not found" warnings
$oldDocFiles = $oldDocFiles | Where-Object { $deploymentFiles -notcontains $_ }

# Move old documentation files
Move-FilesToArchive -files $oldDocFiles -destination "archive\old-docs" -description "documentation"

# Move debug files
Move-FilesToArchive -files $debugFiles -destination "archive\debug-scripts" -description "debug"

# Delete unnecessary files
Remove-UnnecessaryFiles -files $filesToDelete

Write-Success "Cleanup completed successfully!"
