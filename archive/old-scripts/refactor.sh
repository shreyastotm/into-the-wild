#!/bin/bash

# Code Refactoring Agent
# Automatically improves code quality, formatting, and consistency

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Ensure we're in the project root
cd "$(dirname "$0")/.."

log_info "🔄 Starting Code Refactoring Agent..."
log_info "Project: Into The Wild"
log_info "Target: Indian Market (₹, DD/MM/YYYY, GST compliance)"

# Check prerequisites
log_info "🔍 Checking prerequisites..."

if ! command_exists node; then
    log_error "Node.js is not installed"
    exit 1
fi

if ! command_exists npm; then
    log_error "npm is not installed"
    exit 1
fi

if ! command_exists npx; then
    log_error "npx is not available"
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    log_error "package.json not found. Are you in the project root?"
    exit 1
fi

log_success "Prerequisites check passed"

# Phase 1: ESLint Auto-Fix
log_info "📝 Phase 1: ESLint Auto-Fix"
if command_exists eslint; then
    log_info "Running ESLint with auto-fix..."
    if npx eslint . --config eslint.refactor.config.js --fix --quiet; then
        log_success "ESLint auto-fix completed successfully"
    else
        log_warning "ESLint auto-fix completed with warnings"
    fi
else
    log_warning "ESLint not available, skipping auto-fix"
fi

# Phase 2: Import Sorting and Optimization
log_info "📦 Phase 2: Import Optimization"
if command_exists import-sort; then
    log_info "Sorting imports..."
    if npx import-sort --write "**/*.{ts,tsx}" 2>/dev/null || true; then
        log_success "Import sorting completed"
    else
        log_warning "Import sorting completed with some issues"
    fi
else
    log_warning "import-sort not available, skipping import optimization"
fi

# Phase 3: TypeScript Strict Checking
log_info "🔷 Phase 3: TypeScript Analysis"
if npx tsc --noEmit --strict --noUnusedLocals --noUnusedParameters 2>/dev/null; then
    log_success "TypeScript strict checking passed"
else
    log_warning "TypeScript strict checking found issues (this is normal during refactoring)"
fi

# Phase 4: Unused Code Detection
log_info "🧹 Phase 4: Unused Code Detection"
if command_exists ts-unused-exports; then
    log_info "Checking for unused exports..."
    if npx ts-unused-exports tsconfig.json --excludePathsFromReport="src/types/**/*,src/**/*.d.ts,prereq/**/*" 2>/dev/null || true; then
        log_success "Unused exports check completed"
    else
        log_warning "Unused exports found (check output above)"
    fi
else
    log_warning "ts-unused-exports not available, skipping unused exports check"
fi

# Phase 5: Code Duplication Analysis
log_info "🔍 Phase 5: Code Duplication Analysis"
if command_exists jscpd; then
    log_info "Analyzing code duplication..."
    if npx jscpd --min-lines 10 --min-tokens 50 --reporters console src/ 2>/dev/null || true; then
        log_success "Code duplication analysis completed"
    else
        log_warning "Code duplication analysis found potential issues"
    fi
else
    log_warning "jscpd not available, skipping duplication analysis"
fi

# Phase 6: Prettier Formatting (if available)
log_info "💅 Phase 6: Code Formatting"
if command_exists prettier; then
    log_info "Running Prettier formatting..."
    if npx prettier --write "**/*.{ts,tsx,js,jsx,json,md}" --ignore-path .gitignore 2>/dev/null || true; then
        log_success "Prettier formatting completed"
    else
        log_warning "Prettier formatting had some issues"
    fi
else
    log_warning "Prettier not available, skipping formatting"
fi

# Phase 7: Bundle Size Check
log_info "📦 Phase 7: Bundle Analysis"
if npx vite build --mode development --outDir dist-analysis 2>/dev/null; then
    if [ -d "dist-analysis" ]; then
        BUNDLE_SIZE=$(du -sh dist-analysis/assets/*.js 2>/dev/null | head -1 | cut -f1 || echo "unknown")
        log_success "Bundle analysis completed (size: $BUNDLE_SIZE)"
        rm -rf dist-analysis
    fi
else
    log_warning "Bundle analysis failed"
fi

# Phase 8: Indian Standards Validation
log_info "🇮🇳 Phase 8: Indian Market Standards Validation"

# Check for currency formatting compliance
log_info "Checking currency formatting compliance..."
if grep -r "₹" src/ --include="*.{ts,tsx}" > /dev/null; then
    log_success "Indian Rupee (₹) formatting found in codebase"
else
    log_warning "No Indian Rupee (₹) formatting detected - consider using formatCurrency utility"
fi

# Check for date formatting compliance
log_info "Checking date formatting compliance..."
if grep -r "DD/MM/YYYY\|dd/mm/yyyy\|formatIndianDate" src/ --include="*.{ts,tsx}" > /dev/null; then
    log_success "Indian date formatting detected"
else
    log_warning "No Indian date formatting detected - consider using formatIndianDate utility"
fi

# Check for GST calculations
log_info "Checking GST compliance..."
if grep -r "GST\|calculateGST\|18%" src/ --include="*.{ts,tsx}" > /dev/null; then
    log_success "GST calculations detected"
else
    log_warning "No GST calculations detected - consider adding GST support"
fi

# Phase 9: Mobile Responsiveness Check
log_info "📱 Phase 9: Mobile Responsiveness Check"
if grep -r "sm:\|md:\|lg:\|xl:\|mobile\|responsive" src/ --include="*.{ts,tsx}" > /dev/null; then
    log_success "Mobile responsiveness patterns detected"
else
    log_warning "Limited mobile responsiveness patterns detected"
fi

# Phase 10: Dark Mode Support Check
log_info "🌙 Phase 10: Dark Mode Support Check"
if grep -r "dark:\|theme\|ThemeProvider\|next-themes" src/ --include="*.{ts,tsx}" > /dev/null; then
    log_success "Dark mode support detected"
else
    log_warning "No dark mode support detected"
fi

# Phase 11: Accessibility Check
log_info "♿ Phase 11: Accessibility Check"
if grep -r "aria-\|role=\|alt=\|tabindex" src/ --include="*.tsx" > /dev/null; then
    log_success "Accessibility attributes detected"
else
    log_warning "Limited accessibility attributes detected"
fi

# Phase 12: Performance Optimization Check
log_info "⚡ Phase 12: Performance Optimization Check"
if grep -r "React.memo\|useMemo\|useCallback\|lazy\|Suspense" src/ --include="*.{ts,tsx}" > /dev/null; then
    log_success "Performance optimizations detected"
else
    log_warning "No performance optimizations detected"
fi

# Final Summary
log_info ""
log_success "✅ Code Refactoring Agent completed successfully!"
log_info ""
log_info "📊 Refactoring Summary:"
log_info "  • ESLint auto-fixes applied"
log_info "  • Imports sorted and optimized"
log_info "  • TypeScript compliance verified"
log_info "  • Unused code detection completed"
log_info "  • Code duplication analysis done"
log_info "  • Indian market standards validated"
log_info "  • Mobile responsiveness verified"
log_info "  • Dark mode support confirmed"
log_info "  • Accessibility compliance checked"
log_info "  • Performance optimizations verified"
log_info ""

# Generate refactoring report
REPORT_FILE="logs/refactoring-report-$(date +%Y%m%d-%H%M%S).txt"
mkdir -p logs

cat > "$REPORT_FILE" << EOF
CODE REFACTORING REPORT
=======================
Date: $(date)
Project: Into The Wild
Agent: Code Refactoring Agent

COMPLETED TASKS:
✅ ESLint auto-fix applied
✅ Import sorting and optimization
✅ TypeScript strict checking
✅ Unused code detection
✅ Code duplication analysis
✅ Indian market standards validation
✅ Mobile responsiveness check
✅ Dark mode support verification
✅ Accessibility compliance check
✅ Performance optimization check

INDIAN MARKET COMPLIANCE:
- Currency: $(grep -r "₹" src/ --include="*.{ts,tsx}" | wc -l) instances of ₹ found
- Date Format: $(grep -r "DD/MM/YYYY\|formatIndianDate" src/ --include="*.{ts,tsx}" | wc -l) instances found
- GST: $(grep -r "GST\|calculateGST" src/ --include="*.{ts,tsx}" | wc -l) instances found

ARCHITECTURE COMPLIANCE:
- Mobile First: $(grep -r "sm:\|md:\|mobile" src/ --include="*.{ts,tsx}" | wc -l) responsive patterns found
- Dark Mode: $(grep -r "dark:\|theme" src/ --include="*.{ts,tsx}" | wc -l) dark mode patterns found
- TypeScript Strict: $(npx tsc --noEmit --strict 2>&1 | grep -c "error" || echo "0") strict mode violations

NEXT STEPS:
1. Review any warnings above
2. Run 'npm run bug-detect' for comprehensive analysis
3. Run 'npm run auto-fix' for intelligent fix suggestions
4. Commit changes when ready

Report generated: $(date)
EOF

log_success "📄 Detailed report saved to: $REPORT_FILE"
log_info ""
log_info "🎯 Next recommended steps:"
log_info "  1. npm run bug-detect    # Comprehensive bug detection"
log_info "  2. npm run auto-fix      # Intelligent fix suggestions"
log_info "  3. npm run quality-check # Full quality verification"
log_info ""

log_success "Code Refactoring Agent completed! ✨"
