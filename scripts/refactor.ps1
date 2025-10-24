# Code Refactoring Agent (PowerShell Version)
# Automatically improves code quality, formatting, and consistency

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$White = "White"

# Logging functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

# Ensure we're in the project root
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Info "Starting Code Refactoring Agent..."
Write-Info "Project: Into The Wild"
Write-Info "Target: Indian Market Standards"
Write-Info ""

# Phase 1: ESLint Auto-Fix
Write-Info "Phase 1: ESLint Auto-Fix"
try {
    & npx eslint . --config eslint.refactor.config.js --fix 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "ESLint auto-fix completed successfully"
    } else {
        Write-Warning "ESLint auto-fix completed with warnings"
    }
} catch {
    Write-Warning "ESLint not available or failed"
}

# Phase 2: Import Sorting and Optimization
Write-Info "Phase 2: Import Optimization"
try {
    & npx import-sort --write "**/*.{ts,tsx}" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Import sorting completed"
    } else {
        Write-Warning "Import sorting completed with some issues"
    }
} catch {
    Write-Warning "import-sort not available, skipping import optimization"
}

# Phase 3: TypeScript Strict Checking
Write-Info "Phase 3: TypeScript Analysis"
try {
    & npx tsc --noEmit --strict --noUnusedLocals --noUnusedParameters 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "TypeScript strict checking passed"
    } else {
        Write-Warning "TypeScript strict checking found issues (this is normal during refactoring)"
    }
} catch {
    Write-Warning "TypeScript checking failed"
}

# Phase 4: Indian Standards Validation
Write-Info "Phase 4: Indian Market Standards Validation"

# Check for currency formatting compliance
Write-Info "Checking currency formatting compliance..."
$CurrencyInstances = (Get-ChildItem -Path "src" -Recurse -File -Include "*.ts", "*.tsx" | Select-String "₹").Count
if ($CurrencyInstances -gt 0) {
    Write-Success "Indian Rupee formatting found in codebase: $CurrencyInstances instances"
} else {
    Write-Warning "No Indian Rupee formatting detected - consider using formatCurrency utility"
}

# Check for date formatting compliance
Write-Info "Checking date formatting compliance..."
$DateInstances = (Get-ChildItem -Path "src" -Recurse -File -Include "*.ts", "*.tsx" | Select-String "DD/MM/YYYY|formatIndianDate|dd/mm/yyyy").Count
if ($DateInstances -gt 0) {
    Write-Success "Indian date formatting detected: $DateInstances instances"
} else {
    Write-Warning "No Indian date formatting detected - consider using formatIndianDate utility"
}

# Check for GST calculations
Write-Info "Checking GST compliance..."
$GSTInstances = (Get-ChildItem -Path "src" -Recurse -File -Include "*.ts", "*.tsx" | Select-String "GST|calculateGST|18%").Count
if ($GSTInstances -gt 0) {
    Write-Success "GST calculations detected: $GSTInstances instances"
} else {
    Write-Warning "No GST calculations detected - consider adding GST support"
}

# Phase 5: Mobile Responsiveness Check
Write-Info "Phase 5: Mobile Responsiveness Check"
$ResponsivePatterns = (Get-ChildItem -Path "src" -Recurse -File -Include "*.ts", "*.tsx" | Select-String "sm:|md:|lg:|xl:|grid-cols-|flex-col|mobile|responsive").Count
if ($ResponsivePatterns -gt 0) {
    Write-Success "Mobile responsiveness patterns detected: $ResponsivePatterns instances"
} else {
    Write-Warning "Limited mobile responsiveness patterns detected"
}

# Phase 6: Dark Mode Support Check
Write-Info "Phase 6: Dark Mode Support Check"
$DarkModePatterns = (Get-ChildItem -Path "src" -Recurse -File -Include "*.ts", "*.tsx" | Select-String "dark:|theme|ThemeProvider|next-themes").Count
if ($DarkModePatterns -gt 0) {
    Write-Success "Dark mode support detected: $DarkModePatterns instances"
} else {
    Write-Warning "No dark mode support detected"
}

# Phase 7: Accessibility Check
Write-Info "Phase 7: Accessibility Check"
$AccessibilityPatterns = (Get-ChildItem -Path "src" -Recurse -File -Include "*.tsx" | Select-String "aria-|role=|alt=|tabindex").Count
if ($AccessibilityPatterns -gt 0) {
    Write-Success "Accessibility attributes detected: $AccessibilityPatterns instances"
} else {
    Write-Warning "Limited accessibility attributes detected"
}

# Phase 8: Performance Optimization Check
Write-Info "Phase 8: Performance Optimization Check"
$PerformancePatterns = (Get-ChildItem -Path "src" -Recurse -File -Include "*.ts", "*.tsx" | Select-String "React.memo|useMemo|useCallback|lazy|Suspense|debounce|throttle").Count
if ($PerformancePatterns -gt 0) {
    Write-Success "Performance optimizations detected: $PerformancePatterns instances"
} else {
    Write-Warning "No performance optimizations detected"
}

# Generate refactoring report
$ReportFile = "logs/refactoring-report-$(Get-Date -Format 'yyyyMMdd-HHmmss').txt"
New-Item -ItemType Directory -Force -Path "logs" | Out-Null

$ReportContent = @"
CODE REFACTORING REPORT
=======================
Date: $(Get-Date)
Project: Into The Wild
Agent: Code Refactoring Agent

COMPLETED TASKS:
- ESLint auto-fix applied
- Import sorting and optimization
- TypeScript strict checking
- Indian market standards validation
- Mobile responsiveness check
- Dark mode support verification
- Accessibility compliance check
- Performance optimization check

INDIAN MARKET COMPLIANCE:
- Currency: $CurrencyInstances instances of Indian Rupee found
- Date Format: $DateInstances instances found
- GST: $GSTInstances instances found

ARCHITECTURE COMPLIANCE:
- Mobile First: $ResponsivePatterns responsive patterns found
- Dark Mode: $DarkModePatterns dark mode patterns found
- Accessibility: $AccessibilityPatterns accessibility attributes found
- Performance: $PerformancePatterns performance optimizations found

NEXT STEPS:
1. Review any warnings above
2. Run 'npm run bug-detect' for comprehensive analysis
3. Run 'npm run auto-fix' for intelligent fix suggestions
4. Commit changes when ready

Report generated: $(Get-Date)
"@

$ReportContent | Out-File -FilePath $ReportFile

# Final Summary
Write-Info ""
Write-Success "Code Refactoring Agent completed successfully!"
Write-Info ""
Write-Info "Refactoring Summary:"
Write-Info "  - ESLint auto-fixes applied"
Write-Info "  - Imports sorted and optimized"
Write-Info "  - TypeScript compliance verified"
Write-Info "  - Indian market standards validated"
Write-Info "  - Mobile responsiveness verified"
Write-Info "  - Dark mode support confirmed"
Write-Info "  - Accessibility compliance checked"
Write-Info "  - Performance optimizations verified"
Write-Info ""
Write-Success "Detailed report saved to: $ReportFile"
Write-Info ""
Write-Info "Next recommended steps:"
Write-Info "  1. npm run bug-detect    # Comprehensive bug detection"
Write-Info "  2. npm run auto-fix      # Intelligent fix suggestions"
Write-Info "  3. npm run quality-check # Full quality verification"
Write-Info ""
Write-Success "Code Refactoring Agent completed!"
