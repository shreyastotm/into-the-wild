# ====================================================================
# Pre-Deployment Cleanup Script (PowerShell)
# Into The Wild - Production Preparation
# ====================================================================
# 
# This script automates the cleanup of redundant files and folders
# before production deployment.
#
# USAGE:
#   .\scripts\pre-deploy-cleanup.ps1
#
# ====================================================================

# Stop on errors
$ErrorActionPreference = "Stop"

# Counters
$DeletedFiles = 0
$BackedUpFiles = 0
$Errors = 0

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "  Pre-Deployment Cleanup Script" -ForegroundColor Blue
Write-Host "  Into The Wild" -ForegroundColor Blue
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""

# ====================================================================
# SAFETY CHECK
# ====================================================================

Write-Host "⚠️  SAFETY CHECK" -ForegroundColor Yellow
Write-Host "This script will:"
Write-Host "  1. Delete duplicate/redundant files"
Write-Host "  2. Archive database dumps"
Write-Host "  3. Clean up build artifacts"
Write-Host ""

$confirm = Read-Host "Have you committed all your work? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Aborted. Please commit your work first." -ForegroundColor Red
    exit 1
}

Write-Host ""
$backup = Read-Host "Do you want to create a backup first? (y/n)"

# ====================================================================
# CREATE BACKUP
# ====================================================================

if ($backup -eq "y" -or $backup -eq "Y") {
    Write-Host ""
    Write-Host "📦 Creating backup..." -ForegroundColor Blue
    
    $BackupDir = "backups/pre-deploy-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
    
    # Backup files that will be deleted
    $FilesToBackup = @(
        "src/integrations/supabase/types.tsnpx",
        "src/into-the-wild.code-workspace",
        "src/components/trek/CreateTrekMultiStepForm.tsx"
    )
    
    foreach ($file in $FilesToBackup) {
        if (Test-Path $file) {
            Copy-Item $file $BackupDir -ErrorAction SilentlyContinue
            $BackedUpFiles++
            Write-Host "  ✓ Backed up: $file" -ForegroundColor Green
        }
    }
    
    # Backup folders
    if (Test-Path "database-archive") {
        Compress-Archive -Path "database-archive" -DestinationPath "$BackupDir/database-archive.zip"
        Write-Host "  ✓ Backed up: database-archive/" -ForegroundColor Green
        $BackedUpFiles++
    }
    
    if (Test-Path "db") {
        Compress-Archive -Path "db" -DestinationPath "$BackupDir/db.zip"
        Write-Host "  ✓ Backed up: db/" -ForegroundColor Green
        $BackedUpFiles++
    }
    
    Write-Host "✅ Backup created: $BackupDir" -ForegroundColor Green
    Write-Host "   Backed up $BackedUpFiles items"
    Write-Host ""
}

# ====================================================================
# DELETE DUPLICATE TYPE FILE
# ====================================================================

Write-Host "🗑️  Removing duplicate files..." -ForegroundColor Blue

if (Test-Path "src/integrations/supabase/types.tsnpx") {
    Remove-Item "src/integrations/supabase/types.tsnpx"
    Write-Host "  ✓ Deleted: src/integrations/supabase/types.tsnpx" -ForegroundColor Green
    $DeletedFiles++
} else {
    Write-Host "  ⊘ Not found: types.tsnpx (already deleted?)" -ForegroundColor Yellow
}

# ====================================================================
# DELETE MISPLACED WORKSPACE FILE
# ====================================================================

if (Test-Path "src/into-the-wild.code-workspace") {
    Remove-Item "src/into-the-wild.code-workspace"
    Write-Host "  ✓ Deleted: src/into-the-wild.code-workspace" -ForegroundColor Green
    $DeletedFiles++
} else {
    Write-Host "  ⊘ Not found: src workspace file (already deleted?)" -ForegroundColor Yellow
}

# ====================================================================
# DELETE OLD TREK FORM
# ====================================================================

if (Test-Path "src/components/trek/CreateTrekMultiStepForm.tsx") {
    Remove-Item "src/components/trek/CreateTrekMultiStepForm.tsx"
    Write-Host "  ✓ Deleted: CreateTrekMultiStepForm.tsx (old version)" -ForegroundColor Green
    $DeletedFiles++
} else {
    Write-Host "  ⊘ Not found: Old trek form (already deleted?)" -ForegroundColor Yellow
}

Write-Host ""

# ====================================================================
# CLEAN ARCHIVE FOLDERS
# ====================================================================

Write-Host "📁 Cleaning archive folders..." -ForegroundColor Blue

if (Test-Path "database-archive") {
    Remove-Item -Recurse -Force "database-archive"
    Write-Host "  ✓ Deleted: database-archive/ (25+ files)" -ForegroundColor Green
    $DeletedFiles++
} else {
    Write-Host "  ⊘ Not found: database-archive/ (already deleted?)" -ForegroundColor Yellow
}

if (Test-Path "db") {
    Remove-Item -Recurse -Force "db"
    Write-Host "  ✓ Deleted: db/ folder" -ForegroundColor Green
    $DeletedFiles++
} else {
    Write-Host "  ⊘ Not found: db/ (already deleted?)" -ForegroundColor Yellow
}

Write-Host ""

# ====================================================================
# REMOVE DIST FROM GIT
# ====================================================================

Write-Host "🚫 Removing dist/ from git tracking..." -ForegroundColor Blue

try {
    $gitCheck = git ls-files --error-unmatch dist/ 2>&1
    if ($LASTEXITCODE -eq 0) {
        git rm -r --cached dist/ 2>&1 | Out-Null
        Write-Host "  ✓ Removed dist/ from git (kept local files)" -ForegroundColor Green
    } else {
        Write-Host "  ⊘ dist/ not tracked by git" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  ⊘ dist/ not tracked by git" -ForegroundColor Yellow
}

Write-Host ""

# ====================================================================
# CHECK CONSOLE.LOGS
# ====================================================================

Write-Host "🔍 Checking for console.log statements..." -ForegroundColor Blue

$ConsoleCount = (Select-String -Path "src\*" -Pattern "console\.log" -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count

if ($ConsoleCount -gt 0) {
    Write-Host "  ⚠️  Found $ConsoleCount console.log statements" -ForegroundColor Yellow
    Write-Host "   Manual cleanup required before production!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Top files with console.logs:" -ForegroundColor Yellow
    
    $topFiles = Select-String -Path "src\*" -Pattern "console\.log" -Recurse -ErrorAction SilentlyContinue | 
                Group-Object Path | 
                Sort-Object Count -Descending | 
                Select-Object -First 5
    
    foreach ($file in $topFiles) {
        $fileName = Split-Path $file.Name -Leaf
        Write-Host "    • $fileName ($($file.Count) logs)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  ✓ No console.log statements found!" -ForegroundColor Green
}

Write-Host ""

# ====================================================================
# SUMMARY
# ====================================================================

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host "✨ Cleanup Summary" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Blue
Write-Host ""
Write-Host "  Files deleted:     $DeletedFiles"
if ($backup -eq "y" -or $backup -eq "Y") {
    Write-Host "  Files backed up:   $BackedUpFiles"
    Write-Host "  Backup location:   $BackupDir"
}
Write-Host "  Console.logs:      $ConsoleCount (manual cleanup needed)"
Write-Host ""

# ====================================================================
# NEXT STEPS
# ====================================================================

Write-Host "📋 Next Steps:" -ForegroundColor Blue
Write-Host ""
Write-Host "  1. Review changes:"
Write-Host "     git status" -ForegroundColor Yellow
Write-Host ""
Write-Host "  2. Update .gitignore (manual):"
Write-Host "     Add: .env, .env.local, *.code-workspace"
Write-Host ""
Write-Host "  3. Remove console.logs:"
Write-Host "     Select-String -Path 'src\*' -Pattern 'console\.log' -Recurse" -ForegroundColor Yellow
Write-Host ""
Write-Host "  4. Test build:"
Write-Host "     npm run build" -ForegroundColor Yellow
Write-Host ""
Write-Host "  5. Commit changes:"
Write-Host "     git add ." -ForegroundColor Yellow
Write-Host "     git commit -m 'chore: pre-deployment cleanup'" -ForegroundColor Yellow
Write-Host ""

# ====================================================================
# WARNINGS
# ====================================================================

if ($ConsoleCount -gt 0) {
    Write-Host "⚠️  WARNING: Console.log cleanup still required!" -ForegroundColor Red
    Write-Host ""
}

Write-Host "✅ Cleanup completed successfully!" -ForegroundColor Green
Write-Host ""

exit 0


