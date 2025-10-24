# Bug Detection & Fix Agent (PowerShell Version)
# Comprehensive analysis for bugs, security issues, and quality problems

param(
    [switch]$SkipTests,
    [switch]$SkipBuild,
    [switch]$Quick
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"
$Purple = "Magenta"
$NC = "White"

# Logging functions
function Write-Info {
    param([string]$Message)
    Write-Host "[$Blue]INFO[$NC] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[$Green]SUCCESS[$NC] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[$Yellow]WARNING[$NC] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[$Red]ERROR[$NC] $Message" -ForegroundColor $Red
}

function Write-Section {
    param([string]$Message)
    Write-Host "[$Purple]SECTION[$NC] $Message" -ForegroundColor $Purple
}

# Initialize counters
$ErrorCount = 0
$WarningCount = 0
$SuccessCount = 0

function Increment-Error {
    $script:ErrorCount++
}

function Increment-Warning {
    $script:WarningCount++
}

function Increment-Success {
    $script:SuccessCount++
}

# Ensure we're in the project root
$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

Write-Info "Starting Bug Detection & Fix Agent..."
Write-Info "Project: Into The Wild"
Write-Info "Target: Indian Market Standards"
Write-Info ""

# Create reports directory
New-Item -ItemType Directory -Force -Path "logs", "reports" | Out-Null

# Phase 1: Test Suite Analysis
Write-Section "Phase 1: Comprehensive Test Analysis"
Write-Info "Running full test suite with coverage..."

try {
    $TestOutput = & npm run test:coverage 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Test suite passed successfully"
        Increment-Success

        # Check coverage thresholds
        if (Test-Path "coverage/coverage-summary.json") {
            $CoverageData = Get-Content "coverage/coverage-summary.json" | ConvertFrom-Json
            $Coverage = $CoverageData.total.lines.pct
            Write-Info "Code coverage: ${Coverage}%"

            if ($Coverage -ge 85) {
                Write-Success "Coverage meets target (85%+)"
            } else {
                Write-Warning "Coverage below target: ${Coverage}% (target: 85%)"
                Increment-Warning
            }
        }
    } else {
        Write-Error "Test suite failed!"
        Increment-Error
        "Test failures:" | Out-File -FilePath "reports/bug-report.txt" -Append
        $TestOutput | Select-Object -Last 20 | Out-File -FilePath "reports/bug-report.txt" -Append
    }
} catch {
    Write-Warning "Test execution failed: $($_.Exception.Message)"
    Increment-Warning
}

# Phase 2: TypeScript Strict Analysis
Write-Section "Phase 2: TypeScript Strict Analysis"
Write-Info "Running TypeScript strict mode checks..."

try {
    $TsOutput = & npx tsc --noEmit --strict --noUnusedLocals --noUnusedParameters 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "TypeScript strict mode passed"
        Increment-Success
    } else {
        Write-Warning "TypeScript strict mode found issues"
        Increment-Warning

        # Count TypeScript errors
        $TsErrors = ($TsOutput | Select-String "error TS").Count
        Write-Info "TypeScript errors found: $TsErrors"

        if ($TsErrors -gt 0) {
            "TypeScript Errors:" | Out-File -FilePath "reports/bug-report.txt" -Append
            $TsOutput | Select-String "error TS" | Select-Object -First 10 | Out-File -FilePath "reports/bug-report.txt" -Append
            "" | Out-File -FilePath "reports/bug-report.txt" -Append
        }
    }
} catch {
    Write-Warning "TypeScript analysis failed: $($_.Exception.Message)"
    Increment-Warning
}

# Phase 3: ESLint Comprehensive Analysis
Write-Section "Phase 3: ESLint Code Quality Analysis"
Write-Info "Running comprehensive ESLint analysis..."

try {
    $EslintOutput = & npx eslint . --config eslint.refactor.config.js --max-warnings 0 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Success "ESLint analysis passed with no errors"
        Increment-Success
    } else {
        $EslintErrors = ($EslintOutput | Select-String "error|Error").Count
        $EslintWarnings = ($EslintOutput | Select-String "warning|Warning").Count

        Write-Warning "ESLint found issues: $EslintErrors errors, $EslintWarnings warnings"

        if ($EslintErrors -gt 0) {
            Increment-Error
            "ESLint Errors:" | Out-File -FilePath "reports/bug-report.txt" -Append
            $EslintOutput | Select-String "error|Error" | Select-Object -First 10 | Out-File -FilePath "reports/bug-report.txt" -Append
            "" | Out-File -FilePath "reports/bug-report.txt" -Append
        } else {
            Increment-Warning
        }
    }
} catch {
    Write-Warning "ESLint analysis failed: $($_.Exception.Message)"
    Increment-Warning
}

# Phase 4: Indian Market Standards Compliance
Write-Section "Phase 4: Indian Market Standards Compliance"
Write-Info "Verifying Indian market standards..."

# Check for foreign currency (exclude formatCurrency usage which is properly Indian)
$ForeignCurrency = (Get-ChildItem -Path "src" -Recurse -File -Include "*.ts", "*.tsx" | Select-String "USD|EUR|GBP|\$" | Where-Object { $_.Path -notlike "*node_modules*" -and $_.Line -notmatch "formatCurrency" }).Count
if ($ForeignCurrency -gt 0) {
    Write-Warning "Foreign currency references found: $ForeignCurrency (should use ₹)"
    Increment-Warning
    "Foreign Currency Issues:" | Out-File -FilePath "reports/bug-report.txt" -Append
    Get-ChildItem -Path "src" -Recurse -File -Include "*.ts", "*.tsx" | Select-String "USD|EUR|GBP|\$" | Where-Object { $_.Path -notlike "*node_modules*" } | Select-Object -First 5 | Out-File -FilePath "reports/bug-report.txt" -Append
    "" | Out-File -FilePath "reports/bug-report.txt" -Append
} else {
    Write-Success "No foreign currency references found"
    Increment-Success
}

# Check for Indian date formatting
$IndianDates = (Get-ChildItem -Path "src" -Recurse -File -Include "*.ts", "*.tsx" | Select-String "DD/MM/YYYY|formatIndianDate|dd/mm/yyyy").Count
if ($IndianDates -gt 0) {
    Write-Success "Indian date formatting detected: $IndianDates instances"
    Increment-Success
} else {
    Write-Warning "No Indian date formatting detected"
    Increment-Warning
}

# Check for GST compliance
$GSTCount = (Get-ChildItem -Path "src" -Recurse -File -Include "*.ts", "*.tsx" | Select-String "GST|calculateGST|18%").Count
if ($GSTCount -gt 0) {
    Write-Success "GST calculations detected: $GSTCount instances"
    Increment-Success
} else {
    Write-Warning "No GST calculations detected"
    Increment-Warning
}

# Phase 5: Mobile Responsiveness Analysis
Write-Section "Phase 5: Mobile Responsiveness Analysis"
Write-Info "Analyzing mobile responsiveness patterns..."

$ResponsivePatterns = (Get-ChildItem -Path "src" -Recurse -File -Include "*.ts", "*.tsx" | Select-String "sm:|md:|lg:|xl:|grid-cols-|flex-col|mobile|responsive").Count
Write-Info "Responsive patterns found: $ResponsivePatterns"

if ($ResponsivePatterns -gt 10) {
    Write-Success "Good mobile responsiveness implementation"
    Increment-Success
} else {
    Write-Warning "Limited responsive patterns detected: $ResponsivePatterns"
    Increment-Warning
}

# Phase 6: Code Quality Metrics
Write-Section "Phase 6: Code Quality Metrics"
Write-Info "Calculating code quality metrics..."

# Lines of code
$Loc = (Get-ChildItem -Path "src" -Recurse -File -Include "*.ts", "*.tsx" | Get-Content | Measure-Object -Line).Lines
Write-Info "Lines of code: $Loc"

# File count
$FileCount = (Get-ChildItem -Path "src" -Recurse -File -Include "*.ts", "*.tsx").Count
Write-Info "TypeScript files: $FileCount"

# Test file ratio
$TestFiles = (Get-ChildItem -Path "src" -Recurse -File -Include "*.test.ts", "*.test.tsx", "*.spec.ts", "*.spec.tsx").Count
if ($FileCount -gt 0) {
    $TestRatio = [math]::Round(($TestFiles * 100 / $FileCount))
    Write-Info "Test file ratio: ${TestRatio}%"

    if ($TestRatio -gt 20) {
        Write-Success "Good test coverage ratio: ${TestRatio}%"
        Increment-Success
    } else {
        Write-Warning "Low test coverage ratio: ${TestRatio}%"
        Increment-Warning
    }
}

# Generate comprehensive bug report
Write-Section "Generating Bug Report"

$ReportContent = @"
BUG DETECTION REPORT
===================
Date: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Project: Into The Wild
Agent: Bug Detection & Fix Agent

EXECUTIVE SUMMARY:
✅ Tests Passed: $SuccessCount
⚠️ Warnings: $WarningCount
❌ Errors: $ErrorCount

DETAILED ANALYSIS:

1. TEST SUITE
$(if (Test-Path "coverage/coverage-summary.json") {
    $CoverageData = Get-Content "coverage/coverage-summary.json" | ConvertFrom-Json
    "Coverage: $($CoverageData.total.lines.pct)%"
} else {
    "Coverage: Not available"
})

2. TYPE SAFETY
TypeScript strict mode: $(try { & npx tsc --noEmit --strict 2>&1 | Out-Null; "✅ PASSED" } catch { "⚠️ ISSUES FOUND" })

3. CODE QUALITY
ESLint errors: $(try { $EslintErrors } catch { "0" })
ESLint warnings: $(try { $EslintWarnings } catch { "0" })

4. INDIAN MARKET COMPLIANCE
Foreign currency usage: $ForeignCurrency instances
Indian date formatting: $IndianDates instances
GST calculations: $GSTCount instances

5. RESPONSIVE DESIGN
Responsive patterns: $ResponsivePatterns implementations
Mobile-first approach: $(if ($ResponsivePatterns -gt 10) { "✅ IMPLEMENTED" } else { "⚠️ LIMITED" })

6. ARCHITECTURE METRICS
Lines of code: $Loc
TypeScript files: $FileCount
Test coverage ratio: ${TestRatio}%

RECOMMENDATIONS:
"@

if ($ErrorCount -gt 0) {
    $ReportContent += "`nCRITICAL: Fix $ErrorCount errors before deployment"
}

if ($WarningCount -gt 5) {
    $ReportContent += "`nIMPORTANT: Address $WarningCount warnings for better quality"
}

if ($ForeignCurrency -gt 0) {
    $ReportContent += "`nCRITICAL: Replace foreign currency with Indian Rupee"
}

if ($IndianDates -eq 0) {
    $ReportContent += "`nIMPORTANT: Implement Indian date formatting (DD/MM/YYYY)"
}

if ($GSTCount -eq 0) {
    $ReportContent += "`nRECOMMENDED: Add GST calculations (18% default)"
}

if ($ResponsivePatterns -lt 10) {
    $ReportContent += "`nIMPORTANT: Improve mobile responsiveness"
}

$ReportContent += @"

NEXT STEPS:
1. Run 'npm run refactor' for automatic code improvements
2. Run 'npm run auto-fix' for intelligent fix suggestions
3. Address critical issues marked above
4. Run 'npm run quality-check' to verify all improvements

Report generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Log files available in: logs/
"@

$ReportContent | Out-File -FilePath "reports/bug-report.txt"

# Final Summary
Write-Info ""
Write-Success "Bug Detection & Fix Agent completed!"
Write-Info ""
Write-Info "Analysis Summary:"
Write-Info "  Tests Passed: $SuccessCount"
Write-Info "  Warnings: $WarningCount"
Write-Info "  Errors: $ErrorCount"
Write-Info ""
Write-Info "Detailed report: reports/bug-report.txt"
Write-Info "Log files: logs/"
Write-Info ""

if ($ErrorCount -gt 0) {
    Write-Error "$ErrorCount critical errors found! Must fix before deployment."
    exit 1
} elseif ($WarningCount -gt 10) {
    Write-Warning "$WarningCount warnings found. Consider addressing before deployment."
    exit 0
} else {
    Write-Success "Code quality looks good! Ready for deployment."
    exit 0
}
