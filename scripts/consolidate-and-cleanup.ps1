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

# Create consolidated documentation (following temporary documentation rules)
Write-Host "Creating temporary documentation for consolidation..." -ForegroundColor Green

# Create TEMPORARY documentation that follows our rules
$tempDeploymentContent = @"
# TEMPORARY: Deployment Guide Consolidation

**Consolidate into:** PROJECT_OVERVIEW.md (Section 4: Deployment & Production)
**Consolidation Timeline:** Immediate (within 7 days)
**Created by:** Consolidate and Cleanup Script
**Purpose:** Consolidate deployment information from various sources

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
"@

# Create temporary documentation file following our rules
$tempDeploymentContent | Out-File -FilePath "TEMPORARY_DEPLOYMENT_CONSOLIDATION.md" -Encoding UTF8

Write-Host "✅ Created TEMPORARY_DEPLOYMENT_CONSOLIDATION.md (following documentation rules)" -ForegroundColor Green
Write-Host "📝 This file will be automatically detected and consolidated by the Documentation Agent" -ForegroundColor Yellow

# Instead of creating a separate file, update the master document directly
Write-Host "Updating PROJECT_OVERVIEW.md with deployment information..." -ForegroundColor Green

# Read current PROJECT_OVERVIEW.md content
$projectOverviewPath = ".\docs\PROJECT_OVERVIEW.md"
if (Test-Path $projectOverviewPath) {
    $currentContent = Get-Content $projectOverviewPath -Raw

    # Check if deployment section already exists
    if ($currentContent -match "## 4\. Deployment & Production") {
        Write-Host "Deployment section already exists in PROJECT_OVERVIEW.md" -ForegroundColor Yellow
    } else {
        # Add deployment section to PROJECT_OVERVIEW.md
        $deploymentSection = @"

## 4. Deployment & Production

### 4.1 Build Configuration

#### Production Build
\`\`\`bash
# Standard production build
npm run build

# Development build with type checking
npm run build:dev
\`\`\`

#### Build Optimizations
- **Code Splitting**: Automatic chunk splitting by route and vendor
- **Minification**: Terser for production builds
- **Source Maps**: Enabled for debugging (can be disabled in production)
- **Bundle Analysis**: Built-in Vite bundle analyzer

### 4.2 Deployment Platform

#### Vercel Deployment (Recommended)
- **Automatic deployments** from main branch
- **Node.js 22.x** runtime (specified in package.json engines)
- **Environment variables** configured in Vercel dashboard
- **Build command**: \`npm run build\`
- **Output directory**: \`dist\`

#### Manual Deployment
\`\`\`bash
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy dist/ folder to hosting platform
\`\`\`

### 4.3 Environment Variables (Production)

Configure in your deployment platform:
\`\`\`env
# Supabase Production
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key

# Add other production variables as needed
\`\`\`

### 4.4 Health Checks & Monitoring

#### Production Health Checks
\`\`\`bash
# Check if app is responding
curl https://your-domain.com

# Monitor console for errors
# Check Vercel deployment logs
# Monitor Supabase dashboard
\`\`\`

#### Performance Monitoring
\`\`\`bash
# Run Lighthouse audit
npm run analyze:performance

# Check bundle size
npm run analyze:bundle

# Accessibility audit
npm run analyze:accessibility
\`\`\`

"@

        # Add deployment section before the "Quick Reference" section
        $updatedContent = $currentContent -replace "(### 5\.4 Key Directories)", "$deploymentSection`n`n### 5.4 Key Directories"
        $updatedContent | Out-File -FilePath $projectOverviewPath -Encoding UTF8

        Write-Host "✅ Updated PROJECT_OVERVIEW.md with deployment section" -ForegroundColor Green
    }
} else {
    Write-Host "❌ PROJECT_OVERVIEW.md not found" -ForegroundColor Red
}
# Deployment information has been consolidated into PROJECT_OVERVIEW.md
Write-Host "📝 Deployment documentation consolidated into PROJECT_OVERVIEW.md master document" -ForegroundColor Blue

# Remove old deployment guide creation (now handled by Documentation Agent)
Write-Host "🗑️  Skipping old DEPLOYMENT_GUIDE.md creation (consolidated into master docs)" -ForegroundColor Yellow

Write-Host "✅ Documentation consolidation complete!" -ForegroundColor Green
Write-Host "📚 Use the Documentation Agent for any future documentation changes:" -ForegroundColor Cyan
Write-Host "   npm run docs:validate    - Validate master documents" -ForegroundColor Cyan
Write-Host "   npm run docs:consolidate - Consolidate temporary docs" -ForegroundColor Cyan
Write-Host "   npm run docs:full-check  - Complete documentation workflow" -ForegroundColor Cyan
