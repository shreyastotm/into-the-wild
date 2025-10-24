# Deploy to Vercel Script
# This script automates the deployment process to Vercel

# Set error action preference
$ErrorActionPreference = "Stop"

# Display banner
Write-Host "
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 Into The Wild - Vercel Deployment Script 🚀        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
" -ForegroundColor Cyan

# Function to run a command and check for errors
function Invoke-CommandWithErrorHandling {
    param (
        [string]$Command,
        [string]$Description
    )
    
    Write-Host "`n🔍 $Description" -ForegroundColor Yellow
    Write-Host "   Running: $Command" -ForegroundColor Gray
    
    try {
        Invoke-Expression $Command
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Command failed with exit code: $LASTEXITCODE" -ForegroundColor Red
            return $false
        }
        Write-Host "✅ Command completed successfully" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Command failed: $_" -ForegroundColor Red
        return $false
    }
}

# Step 1: Clean up
Write-Host "`n`n╔═════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ 🧹 Step 1: Cleaning up                                      ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$cleanupSuccess = Invoke-CommandWithErrorHandling -Command "Remove-Item -Path node_modules, dist -Recurse -Force -ErrorAction SilentlyContinue" -Description "Removing node_modules and dist directories"

# Step 2: Install dependencies
Write-Host "`n`n╔═════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ 📦 Step 2: Installing dependencies                          ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$installSuccess = Invoke-CommandWithErrorHandling -Command "npm install" -Description "Installing dependencies"

if (-not $installSuccess) {
    Write-Host "`n❌ Failed to install dependencies. Aborting deployment." -ForegroundColor Red
    exit 1
}

# Step 3: Type checking
Write-Host "`n`n╔═════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ 🔍 Step 3: Type checking                                    ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$typeCheckSuccess = Invoke-CommandWithErrorHandling -Command "npm run type-check" -Description "Running type check"

if (-not $typeCheckSuccess) {
    Write-Host "`n⚠️ Type check failed, but continuing with deployment." -ForegroundColor Yellow
    Write-Host "   This might cause issues during build. Consider fixing type errors." -ForegroundColor Yellow
}

# Step 4: Linting
Write-Host "`n`n╔═════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ 🧐 Step 4: Linting                                          ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$lintSuccess = Invoke-CommandWithErrorHandling -Command "npm run lint" -Description "Running linter"

if (-not $lintSuccess) {
    Write-Host "`n⚠️ Linting failed, but continuing with deployment." -ForegroundColor Yellow
    Write-Host "   This might cause issues during build. Consider fixing lint errors." -ForegroundColor Yellow
}

# Step 5: Building
Write-Host "`n`n╔═════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ 🏗️ Step 5: Building                                         ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$buildSuccess = Invoke-CommandWithErrorHandling -Command "npm run build" -Description "Building the project"

if (-not $buildSuccess) {
    Write-Host "`n❌ Build failed. Cannot proceed with deployment." -ForegroundColor Red
    exit 1
}

# Step 6: Verify build output
Write-Host "`n`n╔═════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ ✅ Step 6: Verifying build output                           ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

if (Test-Path -Path "dist") {
    Write-Host "`n✅ Build output verified. dist directory exists." -ForegroundColor Green
    
    # Check for index.html
    if (Test-Path -Path "dist/index.html") {
        Write-Host "✅ index.html found in dist directory." -ForegroundColor Green
    } else {
        Write-Host "❌ index.html not found in dist directory. Build might be incomplete." -ForegroundColor Red
    }
    
    # Check for assets directory
    if (Test-Path -Path "dist/assets") {
        Write-Host "✅ assets directory found in dist directory." -ForegroundColor Green
        
        # Count JS files
        $jsFiles = Get-ChildItem -Path "dist/assets" -Filter "*.js" -Recurse
        Write-Host "📊 Found $($jsFiles.Count) JavaScript files in assets directory." -ForegroundColor Green
        
        # Count CSS files
        $cssFiles = Get-ChildItem -Path "dist/assets" -Filter "*.css" -Recurse
        Write-Host "📊 Found $($cssFiles.Count) CSS files in assets directory." -ForegroundColor Green
    } else {
        Write-Host "❌ assets directory not found in dist directory. Build might be incomplete." -ForegroundColor Red
    }
} else {
    Write-Host "`n❌ Build output verification failed. dist directory does not exist." -ForegroundColor Red
    exit 1
}

# Step 7: Git operations
Write-Host "`n`n╔═════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ 📝 Step 7: Git operations                                   ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Check if there are changes to commit
$gitStatus = git status --porcelain
if ($gitStatus) {
    $commitMessage = "chore: prepare for Vercel deployment $(Get-Date -Format 'yyyy-MM-dd')"
    
    $gitAddSuccess = Invoke-CommandWithErrorHandling -Command "git add ." -Description "Staging changes"
    
    if ($gitAddSuccess) {
        $gitCommitSuccess = Invoke-CommandWithErrorHandling -Command "git commit -m `"$commitMessage`"" -Description "Committing changes"
        
        if ($gitCommitSuccess) {
            $gitPushSuccess = Invoke-CommandWithErrorHandling -Command "git push origin main" -Description "Pushing to main branch"
            
            if (-not $gitPushSuccess) {
                Write-Host "`n⚠️ Failed to push changes to main branch." -ForegroundColor Yellow
                Write-Host "   You can manually push changes with: git push origin main" -ForegroundColor Yellow
            }
        } else {
            Write-Host "`n⚠️ Failed to commit changes." -ForegroundColor Yellow
            Write-Host "   You can manually commit changes with: git commit -m `"$commitMessage`"" -ForegroundColor Yellow
        }
    } else {
        Write-Host "`n⚠️ Failed to stage changes." -ForegroundColor Yellow
        Write-Host "   You can manually stage changes with: git add ." -ForegroundColor Yellow
    }
} else {
    Write-Host "`n✅ No changes to commit. Repository is clean." -ForegroundColor Green
}

# Step 8: Vercel deployment
Write-Host "`n`n╔═════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ 🚀 Step 8: Vercel deployment                                ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Check if Vercel CLI is installed
$vercelInstalled = $null -ne (Get-Command "vercel" -ErrorAction SilentlyContinue)

if ($vercelInstalled) {
    $deploySuccess = Invoke-CommandWithErrorHandling -Command "vercel --prod" -Description "Deploying to Vercel"
    
    if ($deploySuccess) {
        Write-Host "`n🎉 Deployment to Vercel completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Deployment to Vercel failed." -ForegroundColor Red
        Write-Host "   Check the Vercel dashboard for more details: https://vercel.com/dashboard" -ForegroundColor Yellow
    }
} else {
    Write-Host "`n⚠️ Vercel CLI not found. Cannot deploy automatically." -ForegroundColor Yellow
    Write-Host "   To install Vercel CLI: npm install -g vercel" -ForegroundColor Yellow
    Write-Host "   To deploy manually: vercel --prod" -ForegroundColor Yellow
    Write-Host "   Or use the Vercel dashboard: https://vercel.com/dashboard" -ForegroundColor Yellow
}

# Final summary
Write-Host "`n`n╔═════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║ 📋 Deployment Summary                                       ║" -ForegroundColor Cyan
Write-Host "╚═════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

Write-Host "`n📝 Checklist:" -ForegroundColor White
Write-Host "   ✅ Cleaned up project" -ForegroundColor $(if ($cleanupSuccess) { "Green" } else { "Red" })
Write-Host "   ✅ Installed dependencies" -ForegroundColor $(if ($installSuccess) { "Green" } else { "Red" })
Write-Host "   ✅ Type checking" -ForegroundColor $(if ($typeCheckSuccess) { "Green" } else { "Yellow" })
Write-Host "   ✅ Linting" -ForegroundColor $(if ($lintSuccess) { "Green" } else { "Yellow" })
Write-Host "   ✅ Building" -ForegroundColor $(if ($buildSuccess) { "Green" } else { "Red" })
Write-Host "   ✅ Verifying build output" -ForegroundColor $(if (Test-Path -Path "dist/index.html") { "Green" } else { "Red" })
Write-Host "   ✅ Git operations" -ForegroundColor $(if (-not $gitStatus -or $gitPushSuccess) { "Green" } else { "Yellow" })
Write-Host "   ✅ Vercel deployment" -ForegroundColor $(if ($vercelInstalled -and $deploySuccess) { "Green" } elseif (-not $vercelInstalled) { "Yellow" } else { "Red" })

Write-Host "`n📊 Next Steps:" -ForegroundColor White
Write-Host "   1. Verify deployment on Vercel dashboard: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "   2. Check for any build errors in the Vercel logs" -ForegroundColor White
Write-Host "   3. Test the deployed application" -ForegroundColor White
Write-Host "   4. Set up custom domain if needed" -ForegroundColor White

Write-Host "`n🎉 Deployment process completed!" -ForegroundColor Green
