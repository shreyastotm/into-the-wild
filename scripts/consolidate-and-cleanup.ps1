# Consolidate and Cleanup Script
# This script removes redundant files and consolidates documentation

# Create archive directories if they don't exist
Write-Host "Creating archive directories..." -ForegroundColor Green
$archiveRoot = ".\archive"
$archiveDirs = @(
    "$archiveRoot\old-docs",
    "$archiveRoot\old-scripts",
    "$archiveRoot\temp-files"
)

foreach ($dir in $archiveDirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Yellow
    }
}

# Files to delete (these are redundant and not needed)
Write-Host "Deleting redundant files..." -ForegroundColor Green
$filesToDelete = @(
    ".\comprehensive_fix_and_verify.sql",
    ".\DEBUG_SIGNUP_ISSUE.sql",
    ".\START_HERE_UI_REVAMP.md",
    ".\START_HERE.md"
)

foreach ($file in $filesToDelete) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force
        Write-Host "Deleted: $file" -ForegroundColor Red
    } else {
        Write-Host "File not found: $file" -ForegroundColor Yellow
    }
}

# Move redundant documentation to archive
Write-Host "Moving redundant documentation to archive..." -ForegroundColor Green
$docsToArchive = @(
    ".\docs\CLEANUP_FIXES_SUMMARY.md",
    ".\docs\CLEANUP_MIGRATION.md",
    ".\docs\FINAL_FIXES_AND_UPDATES.md",
    ".\docs\IMPLEMENTATION_UPDATES.md",
    ".\docs\ISSUES_FIXED_SUMMARY.md",
    ".\docs\REFACTORING_SUMMARY.md"
)

foreach ($doc in $docsToArchive) {
    if (Test-Path $doc) {
        $destFile = "$archiveRoot\old-docs\" + (Split-Path $doc -Leaf)
        Move-Item -Path $doc -Destination $destFile -Force
        Write-Host "Archived: $doc to $destFile" -ForegroundColor Blue
    } else {
        Write-Host "File not found: $doc" -ForegroundColor Yellow
    }
}

# Remove redundant shell scripts (keep only PowerShell versions)
Write-Host "Removing redundant shell scripts..." -ForegroundColor Green
$shellScriptsToArchive = @(
    ".\scripts\bug-detector.sh",
    ".\scripts\pre-deploy-cleanup.sh",
    ".\scripts\refactor.sh"
)

foreach ($script in $shellScriptsToArchive) {
    if (Test-Path $script) {
        $destFile = "$archiveRoot\old-scripts\" + (Split-Path $script -Leaf)
        Move-Item -Path $script -Destination $destFile -Force
        Write-Host "Archived: $script to $destFile" -ForegroundColor Blue
    } else {
        Write-Host "File not found: $script" -ForegroundColor Yellow
    }
}

# Update OPTIMIZATION_SUMMARY.md to include information from archived docs
Write-Host "Updating OPTIMIZATION_SUMMARY.md with consolidated information..." -ForegroundColor Green

# Create consolidated documentation
Write-Host "Creating consolidated documentation..." -ForegroundColor Green

# Create a new DEPLOYMENT_GUIDE.md that combines information from START_HERE.md
$deploymentGuideContent = @"
# Into The Wild - Comprehensive Deployment Guide

## Overview
This guide provides a complete deployment process for the Into The Wild application, including pre-deployment preparation, database setup, frontend deployment, and post-deployment verification.

## Pre-Deployment Checklist

- [ ] Vercel account created (https://vercel.com)
- [ ] Supabase project in production (https://supabase.com)
- [ ] Supabase URL and Anon Key ready
- [ ] GitHub repository access
- [ ] Node.js 18+ installed locally

## Deployment Phases

### Phase 1: Pre-Deployment (30 min)
- Run code quality checks
- Verify build works
- Run tests

### Phase 2: Supabase Setup (30 min)
- Apply migrations
- Configure authentication
- Set up storage buckets

### Phase 3: Vercel Deployment (45 min)
- Connect GitHub
- Configure environment variables
- Deploy!

### Phase 4: Post-Deployment (30 min)
- Custom domain (optional)
- Set up monitoring
- Configure analytics

### Phase 5: Testing (30 min)
- Test all features
- Performance audit
- Security verification

## Detailed Steps

### Supabase Setup
\`\`\`bash
# Test migrations on local Docker
docker-compose up -d postgres
npx supabase db reset

# Verify all migrations work
npx supabase db push

# Generate fresh types
npx supabase gen types typescript --local > src/integrations/supabase/types.ts
\`\`\`

### Vercel Deployment
\`\`\`bash
# Clean build
npm run clean:all
npm install

# Production build
npm run build

# Verify build
npm run preview

# Deploy to Vercel
vercel --prod
\`\`\`

## Environment Variables
\`\`\`
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_APP_ENV=production
\`\`\`

## Post-Deployment Verification
- Monitor error logs
- Check performance metrics
- Verify user flows
- Monitor database performance

## Rollback Plan
If deployment fails:
1. Revert frontend deployment
2. Restore database from backup
3. Alert users of maintenance
4. Review error logs
5. Apply hotfix
6. Redeploy after verification

## Maintenance Schedule
### Daily
- Monitor error logs
- Check performance metrics
- Review user feedback

### Weekly
- Run full test suite
- Update dependencies
- Review security alerts
- Backup database

### Monthly
- Performance audit
- Security audit
- Code quality review
- Documentation update
"@

Set-Content -Path ".\docs\DEPLOYMENT_GUIDE.md" -Value $deploymentGuideContent
Write-Host "Created: .\docs\DEPLOYMENT_GUIDE.md" -ForegroundColor Green

Write-Host "Cleanup and consolidation complete!" -ForegroundColor Green
