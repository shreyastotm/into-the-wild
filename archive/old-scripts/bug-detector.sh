#!/bin/bash

# Bug Detection & Fix Agent
# Comprehensive analysis for bugs, security issues, and quality problems

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo -e "${PURPLE}[SECTION]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Ensure we're in the project root
cd "$(dirname "$0")/.."

log_info "🕵️ Starting Bug Detection & Fix Agent..."
log_info "Project: Into The Wild"
log_info "Target: Indian Market (₹, DD/MM/YYYY, GST compliance)"

# Create reports directory
mkdir -p logs reports

# Initialize counters
ERROR_COUNT=0
WARNING_COUNT=0
SUCCESS_COUNT=0

# Helper function to increment counters
increment_error() {
    ERROR_COUNT=$((ERROR_COUNT + 1))
}

increment_warning() {
    WARNING_COUNT=$((WARNING_COUNT + 1))
}

increment_success() {
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
}

# Phase 1: Test Suite Analysis
log_section "🧪 Phase 1: Comprehensive Test Analysis"
log_info "Running full test suite with coverage..."

if npm run test:coverage > logs/test-coverage.log 2>&1; then
    log_success "Test suite passed successfully"
    increment_success

    # Check coverage thresholds
    if [ -f "coverage/coverage-summary.json" ]; then
        COVERAGE=$(node -p "JSON.parse(require('fs').readFileSync('coverage/coverage-summary.json', 'utf8')).total.lines.pct")
        log_info "Code coverage: ${COVERAGE}%"

        if (( $(echo "$COVERAGE >= 85" | bc -l 2>/dev/null || echo "0") )); then
            log_success "Coverage meets target (85%+)"
        else
            log_warning "Coverage below target: ${COVERAGE}% (target: 85%)"
            increment_warning
        fi
    fi
else
    log_error "Test suite failed!"
    increment_error
    echo "Test failures:" >> reports/bug-report.txt
    tail -20 logs/test-coverage.log >> reports/bug-report.txt
fi

# Phase 2: TypeScript Strict Analysis
log_section "🔷 Phase 2: TypeScript Strict Analysis"
log_info "Running TypeScript strict mode checks..."

if npx tsc --noEmit --strict --noUnusedLocals --noUnusedParameters > logs/typescript-analysis.log 2>&1; then
    log_success "TypeScript strict mode passed"
    increment_success
else
    log_warning "TypeScript strict mode found issues"
    increment_warning

    # Count TypeScript errors
    TS_ERRORS=$(grep -c "error TS" logs/typescript-analysis.log || echo "0")
    log_info "TypeScript errors found: $TS_ERRORS"

    if [ "$TS_ERRORS" -gt 0 ]; then
        echo "TypeScript Errors:" >> reports/bug-report.txt
        grep "error TS" logs/typescript-analysis.log >> reports/bug-report.txt
        echo "" >> reports/bug-report.txt
    fi
fi

# Phase 3: ESLint Comprehensive Analysis
log_section "📋 Phase 3: ESLint Code Quality Analysis"
log_info "Running comprehensive ESLint analysis..."

if npx eslint . --config eslint.refactor.config.js --max-warnings 0 > logs/eslint-analysis.log 2>&1; then
    log_success "ESLint analysis passed with no errors"
    increment_success
else
    ESLINT_ERRORS=$(grep -c "error\|Error" logs/eslint-analysis.log || echo "0")
    ESLINT_WARNINGS=$(grep -c "warning\|Warning" logs/eslint-analysis.log || echo "0")

    log_warning "ESLint found issues: $ESLINT_ERRORS errors, $ESLINT_WARNINGS warnings"

    if [ "$ESLINT_ERRORS" -gt 0 ]; then
        increment_error
        echo "ESLint Errors:" >> reports/bug-report.txt
        grep "error\|Error" logs/eslint-analysis.log | head -10 >> reports/bug-report.txt
        echo "" >> reports/bug-report.txt
    else
        increment_warning
    fi
fi

# Phase 4: Security Vulnerability Check
log_section "🔒 Phase 4: Security Vulnerability Analysis"
log_info "Checking for security vulnerabilities..."

if npm audit --audit-level moderate > logs/security-audit.log 2>&1; then
    log_success "No security vulnerabilities found"
    increment_success
else
    SECURITY_ISSUES=$(grep -c "High\|Moderate\|Critical" logs/security-audit.log || echo "0")
    log_warning "Security vulnerabilities detected: $SECURITY_ISSUES"

    if [ "$SECURITY_ISSUES" -gt 0 ]; then
        increment_error
        echo "Security Issues:" >> reports/bug-report.txt
        grep -A 3 -B 1 "High\|Moderate\|Critical" logs/security-audit.log >> reports/bug-report.txt
        echo "" >> reports/bug-report.txt
    fi
fi

# Phase 5: Bundle Size and Performance Analysis
log_section "📦 Phase 5: Bundle Size and Performance Analysis"
log_info "Analyzing bundle size and build performance..."

if npm run build > logs/bundle-analysis.log 2>&1; then
    log_success "Build completed successfully"
    increment_success

    # Analyze bundle size
    if [ -d "dist" ] && [ -f "dist/assets" ]; then
        BUNDLE_SIZE=$(find dist/assets -name "*.js" -exec du -sh {} \; 2>/dev/null | sort -hr | head -1 | cut -f1 || echo "unknown")
        log_info "Main bundle size: $BUNDLE_SIZE"

        # Check if bundle size is reasonable (under 500KB)
        if echo $BUNDLE_SIZE | grep -q "M"; then
            log_error "Bundle size too large: $BUNDLE_SIZE (should be under 500KB)"
            increment_error
        elif echo $BUNDLE_SIZE | grep -q "K"; then
            SIZE_NUM=$(echo $BUNDLE_SIZE | sed 's/K.*//')
            if [ "$SIZE_NUM" -gt 500 ]; then
                log_warning "Bundle size high: $BUNDLE_SIZE (target: < 500KB)"
                increment_warning
            else
                log_success "Bundle size acceptable: $BUNDLE_SIZE"
            fi
        fi
    fi
else
    log_error "Build failed!"
    increment_error
    echo "Build Errors:" >> reports/bug-report.txt
    tail -20 logs/bundle-analysis.log >> reports/bug-report.txt
fi

# Phase 6: Accessibility Compliance Check
log_section "♿ Phase 6: Accessibility Compliance (WCAG 2.1 AA)"
log_info "Checking accessibility compliance..."

# Check for common accessibility issues
ARIA_COUNT=$(grep -r "aria-" src/ --include="*.tsx" | wc -l)
ALT_COUNT=$(grep -r "alt=" src/ --include="*.tsx" | wc -l)
ROLE_COUNT=$(grep -r "role=" src/ --include="*.tsx" | wc -l)

log_info "Accessibility attributes found:"
log_info "  - ARIA attributes: $ARIA_COUNT"
log_info "  - Alt text: $ALT_COUNT"
log_info "  - Roles: $ROLE_COUNT"

if [ "$ARIA_COUNT" -gt 0 ] && [ "$ALT_COUNT" -gt 0 ]; then
    log_success "Accessibility patterns detected"
    increment_success
else
    log_warning "Limited accessibility attributes found"
    increment_warning
fi

# Phase 7: Indian Market Standards Compliance
log_section "🇮🇳 Phase 7: Indian Market Standards Compliance"
log_info "Verifying Indian market standards..."

# Check for hardcoded currencies
FOREIGN_CURRENCY=$(grep -r "USD\|EUR\|GBP\|$\|" src/ --include="*.{ts,tsx}" | grep -v "node_modules" | wc -l)
if [ "$FOREIGN_CURRENCY" -gt 0 ]; then
    log_warning "Foreign currency references found: $FOREIGN_CURRENCY (should use ₹)"
    increment_warning
    echo "Foreign Currency Issues:" >> reports/bug-report.txt
    grep -r "USD\|EUR\|GBP\|$\|" src/ --include="*.{ts,tsx}" | grep -v "node_modules" | head -5 >> reports/bug-report.txt
    echo "" >> reports/bug-report.txt
else
    log_success "No foreign currency references found"
    increment_success
fi

# Check for date formatting
INDIAN_DATES=$(grep -r "DD/MM/YYYY\|formatIndianDate\|dd/mm/yyyy" src/ --include="*.{ts,tsx}" | wc -l)
if [ "$INDIAN_DATES" -gt 0 ]; then
    log_success "Indian date formatting detected: $INDIAN_DATES instances"
    increment_success
else
    log_warning "No Indian date formatting detected"
    increment_warning
fi

# Check for GST compliance
GST_COUNT=$(grep -r "GST\|calculateGST\|18%" src/ --include="*.{ts,tsx}" | wc -l)
if [ "$GST_COUNT" -gt 0 ]; then
    log_success "GST calculations detected: $GST_COUNT instances"
    increment_success
else
    log_warning "No GST calculations detected"
    increment_warning
fi

# Phase 8: Mobile Responsiveness Analysis
log_section "📱 Phase 8: Mobile Responsiveness Analysis"
log_info "Analyzing mobile responsiveness patterns..."

RESPONSIVE_PATTERNS=$(grep -r "sm:\|md:\|lg:\|xl:\|grid-cols-\|flex-col\|mobile\|responsive" src/ --include="*.{ts,tsx}" | wc -l)
log_info "Responsive patterns found: $RESPONSIVE_PATTERNS"

if [ "$RESPONSIVE_PATTERNS" -gt 10 ]; then
    log_success "Good mobile responsiveness implementation"
    increment_success
else
    log_warning "Limited responsive patterns detected: $RESPONSIVE_PATTERNS"
    increment_warning
fi

# Phase 9: Dark Mode Support Analysis
log_section "🌙 Phase 9: Dark Mode Support Analysis"
log_info "Checking dark mode implementation..."

DARK_MODE_PATTERNS=$(grep -r "dark:\|theme\|ThemeProvider\|next-themes" src/ --include="*.{ts,tsx}" | wc -l)
log_info "Dark mode patterns found: $DARK_MODE_PATTERNS"

if [ "$DARK_MODE_PATTERNS" -gt 5 ]; then
    log_success "Dark mode support implemented"
    increment_success
else
    log_warning "Limited dark mode support detected: $DARK_MODE_PATTERNS"
    increment_warning
fi

# Phase 10: Error Handling Analysis
log_section "🚨 Phase 10: Error Handling Analysis"
log_info "Analyzing error handling patterns..."

ERROR_HANDLING_PATTERNS=$(grep -r "try\|catch\|Error\|throw\|ErrorBoundary" src/ --include="*.{ts,tsx}" | wc -l)
log_info "Error handling patterns found: $ERROR_HANDLING_PATTERNS"

if [ "$ERROR_HANDLING_PATTERNS" -gt 20 ]; then
    log_success "Comprehensive error handling implemented"
    increment_success
else
    log_warning "Limited error handling detected: $ERROR_HANDLING_PATTERNS"
    increment_warning
fi

# Phase 11: Performance Pattern Analysis
log_section "⚡ Phase 11: Performance Pattern Analysis"
log_info "Checking performance optimization patterns..."

PERF_PATTERNS=$(grep -r "React.memo\|useMemo\|useCallback\|lazy\|Suspense\|debounce\|throttle" src/ --include="*.{ts,tsx}" | wc -l)
log_info "Performance patterns found: $PERF_PATTERNS"

if [ "$PERF_PATTERNS" -gt 5 ]; then
    log_success "Performance optimizations implemented"
    increment_success
else
    log_warning "Limited performance optimizations: $PERF_PATTERNS"
    increment_warning
fi

# Phase 12: Code Quality Metrics
log_section "📊 Phase 12: Code Quality Metrics"
log_info "Calculating code quality metrics..."

# Lines of code
LOC=$(find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | tail -1 | awk '{print $1}')
log_info "Lines of code: $LOC"

# Cyclomatic complexity (approximation)
COMPLEXITY=$(grep -r "if\|for\|while\|switch\|catch" src/ --include="*.{ts,tsx}" | wc -l)
log_info "Complexity indicators: $COMPLEXITY"

# File count
FILE_COUNT=$(find src -name "*.ts" -o -name "*.tsx" | wc -l)
log_info "TypeScript files: $FILE_COUNT"

# Test file ratio
TEST_FILES=$(find src -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.spec.tsx" | wc -l)
if [ "$FILE_COUNT" -gt 0 ]; then
    TEST_RATIO=$((TEST_FILES * 100 / FILE_COUNT))
    log_info "Test file ratio: ${TEST_RATIO}%"

    if [ "$TEST_RATIO" -gt 20 ]; then
        log_success "Good test coverage ratio: ${TEST_RATIO}%"
        increment_success
    else
        log_warning "Low test coverage ratio: ${TEST_RATIO}%"
        increment_warning
    fi
fi

# Generate comprehensive bug report
log_section "📄 Generating Bug Report"

cat > reports/bug-report.txt << EOF
BUG DETECTION REPORT
===================
Date: $(date)
Project: Into The Wild
Agent: Bug Detection & Fix Agent

EXECUTIVE SUMMARY:
✅ Tests Passed: $SUCCESS_COUNT
⚠️ Warnings: $WARNING_COUNT
❌ Errors: $ERROR_COUNT

DETAILED ANALYSIS:

1. TEST SUITE
$(if [ -f "coverage/coverage-summary.json" ]; then
    echo "Coverage: $(node -p "JSON.parse(require('fs').readFileSync('coverage/coverage-summary.json', 'utf8')).total.lines.pct")%"
else
    echo "Coverage: Not available"
fi)

2. TYPE SAFETY
TypeScript strict mode: $(if npx tsc --noEmit --strict > /dev/null 2>&1; then echo "✅ PASSED"; else echo "⚠️ ISSUES FOUND"; fi)

3. CODE QUALITY
ESLint errors: $(grep -c "error\|Error" logs/eslint-analysis.log 2>/dev/null || echo "0")
ESLint warnings: $(grep -c "warning\|Warning" logs/eslint-analysis.log 2>/dev/null || echo "0")

4. SECURITY
Security vulnerabilities: $(grep -c "High\|Moderate\|Critical" logs/security-audit.log 2>/dev/null || echo "0")

5. BUNDLE SIZE
Main bundle size: $(find dist/assets -name "*.js" -exec du -sh {} \; 2>/dev/null | sort -hr | head -1 | cut -f1 || echo "Not available")

6. INDIAN MARKET COMPLIANCE
Foreign currency usage: $FOREIGN_CURRENCY instances
Indian date formatting: $INDIAN_DATES instances
GST calculations: $GST_COUNT instances

7. RESPONSIVE DESIGN
Responsive patterns: $RESPONSIVE_PATTERNS implementations
Mobile-first approach: $(if [ "$RESPONSIVE_PATTERNS" -gt 10 ]; then echo "✅ IMPLEMENTED"; else echo "⚠️ LIMITED"; fi)

8. ACCESSIBILITY
WCAG 2.1 AA compliance: $(if [ "$ARIA_COUNT" -gt 0 ] && [ "$ALT_COUNT" -gt 0 ]; then echo "✅ GOOD"; else echo "⚠️ NEEDS IMPROVEMENT"; fi)
ARIA attributes: $ARIA_COUNT
Alt text usage: $ALT_COUNT

9. PERFORMANCE
Optimization patterns: $PERF_PATTERNS implementations
Bundle size status: $(if echo $BUNDLE_SIZE | grep -q "M" || [ $(echo $BUNDLE_SIZE | sed 's/K.*//') -gt 500 ] 2>/dev/null; then echo "❌ TOO LARGE"; else echo "✅ ACCEPTABLE"; fi)

10. ARCHITECTURE METRICS
Lines of code: $LOC
Cyclomatic complexity: $COMPLEXITY indicators
Test coverage ratio: ${TEST_RATIO}%
Error handling: $ERROR_HANDLING_PATTERNS patterns

RECOMMENDATIONS:
EOF

# Add specific recommendations based on findings
if [ "$ERROR_COUNT" -gt 0 ]; then
    echo "🔴 CRITICAL: Fix $ERROR_COUNT errors before deployment" >> reports/bug-report.txt
fi

if [ "$WARNING_COUNT" -gt 5 ]; then
    echo "🟡 IMPORTANT: Address $WARNING_COUNT warnings for better quality" >> reports/bug-report.txt
fi

if [ "$FOREIGN_CURRENCY" -gt 0 ]; then
    echo "🇮🇳 CRITICAL: Replace foreign currency with Indian Rupee (₹)" >> reports/bug-report.txt
fi

if [ "$INDIAN_DATES" -eq 0 ]; then
    echo "🇮🇳 IMPORTANT: Implement Indian date formatting (DD/MM/YYYY)" >> reports/bug-report.txt
fi

if [ "$GST_COUNT" -eq 0 ]; then
    echo "🇮🇳 RECOMMENDED: Add GST calculations (18% default)" >> reports/bug-report.txt
fi

if [ "$RESPONSIVE_PATTERNS" -lt 10 ]; then
    echo "📱 IMPORTANT: Improve mobile responsiveness" >> reports/bug-report.txt
fi

if [ "$DARK_MODE_PATTERNS" -lt 5 ]; then
    echo "🌙 RECOMMENDED: Implement comprehensive dark mode support" >> reports/bug-report.txt
fi

if [ "$ARIA_COUNT" -eq 0 ] || [ "$ALT_COUNT" -eq 0 ]; then
    echo "♿ CRITICAL: Improve accessibility (WCAG 2.1 AA compliance)" >> reports/bug-report.txt
fi

if [ "$PERF_PATTERNS" -lt 5 ]; then
    echo "⚡ IMPORTANT: Add performance optimizations (memo, lazy loading)" >> reports/bug-report.txt
fi

echo "" >> reports/bug-report.txt
echo "NEXT STEPS:" >> reports/bug-report.txt
echo "1. Run 'npm run refactor' for automatic code improvements" >> reports/bug-report.txt
echo "2. Run 'npm run auto-fix' for intelligent fix suggestions" >> reports/bug-report.txt
echo "3. Address critical issues marked above" >> reports/bug-report.txt
echo "4. Run 'npm run quality-check' to verify all improvements" >> reports/bug-report.txt

echo "" >> reports/bug-report.txt
echo "Report generated: $(date)" >> reports/bug-report.txt
echo "Log files available in: logs/" >> reports/bug-report.txt

# Final Summary
log_info ""
log_success "🐛 Bug Detection & Fix Agent completed!"
log_info ""
log_info "📊 Analysis Summary:"
log_info "  ✅ Tests Passed: $SUCCESS_COUNT"
log_info "  ⚠️ Warnings: $WARNING_COUNT"
log_info "  ❌ Errors: $ERROR_COUNT"
log_info ""
log_info "📄 Detailed report: reports/bug-report.txt"
log_info "📋 Log files: logs/"
log_info ""

if [ "$ERROR_COUNT" -gt 0 ]; then
    log_error "❌ $ERROR_COUNT critical errors found! Must fix before deployment."
    exit 1
elif [ "$WARNING_COUNT" -gt 10 ]; then
    log_warning "⚠️ $WARNING_COUNT warnings found. Consider addressing before deployment."
    exit 0
else
    log_success "✅ Code quality looks good! Ready for deployment."
    exit 0
fi
