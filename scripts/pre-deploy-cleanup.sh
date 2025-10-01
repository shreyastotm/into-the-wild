#!/bin/bash

# ====================================================================
# Pre-Deployment Cleanup Script
# Into The Wild - Production Preparation
# ====================================================================
# 
# This script automates the cleanup of redundant files and folders
# before production deployment.
#
# USAGE:
#   chmod +x scripts/pre-deploy-cleanup.sh
#   ./scripts/pre-deploy-cleanup.sh
#
# ====================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
DELETED_FILES=0
BACKED_UP_FILES=0
ERRORS=0

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Pre-Deployment Cleanup Script${NC}"
echo -e "${BLUE}  Into The Wild${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# ====================================================================
# SAFETY CHECK
# ====================================================================

echo -e "${YELLOW}⚠️  SAFETY CHECK${NC}"
echo "This script will:"
echo "  1. Delete duplicate/redundant files"
echo "  2. Archive database dumps"
echo "  3. Clean up build artifacts"
echo ""
read -p "Have you committed all your work? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Aborted. Please commit your work first.${NC}"
    exit 1
fi

echo ""
read -p "Do you want to create a backup first? (y/n) " -n 1 -r
echo ""
CREATE_BACKUP=$REPLY

# ====================================================================
# CREATE BACKUP
# ====================================================================

if [[ $CREATE_BACKUP =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}📦 Creating backup...${NC}"
    
    BACKUP_DIR="backups/pre-deploy-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup files that will be deleted
    FILES_TO_BACKUP=(
        "src/integrations/supabase/types.tsnpx"
        "src/into-the-wild.code-workspace"
        "src/components/trek/CreateTrekMultiStepForm.tsx"
    )
    
    for file in "${FILES_TO_BACKUP[@]}"; do
        if [ -f "$file" ]; then
            cp "$file" "$BACKUP_DIR/" 2>/dev/null || true
            BACKED_UP_FILES=$((BACKED_UP_FILES + 1))
            echo -e "  ${GREEN}✓${NC} Backed up: $file"
        fi
    done
    
    # Backup folders
    if [ -d "database-archive" ]; then
        tar -czf "$BACKUP_DIR/database-archive.tar.gz" database-archive/
        echo -e "  ${GREEN}✓${NC} Backed up: database-archive/"
        BACKED_UP_FILES=$((BACKED_UP_FILES + 1))
    fi
    
    if [ -d "db" ]; then
        tar -czf "$BACKUP_DIR/db.tar.gz" db/
        echo -e "  ${GREEN}✓${NC} Backed up: db/"
        BACKED_UP_FILES=$((BACKED_UP_FILES + 1))
    fi
    
    echo -e "${GREEN}✅ Backup created: $BACKUP_DIR${NC}"
    echo -e "   Backed up $BACKED_UP_FILES items"
    echo ""
fi

# ====================================================================
# DELETE DUPLICATE TYPE FILE
# ====================================================================

echo -e "${BLUE}🗑️  Removing duplicate files...${NC}"

if [ -f "src/integrations/supabase/types.tsnpx" ]; then
    rm "src/integrations/supabase/types.tsnpx"
    echo -e "  ${GREEN}✓${NC} Deleted: src/integrations/supabase/types.tsnpx"
    DELETED_FILES=$((DELETED_FILES + 1))
else
    echo -e "  ${YELLOW}⊘${NC} Not found: types.tsnpx (already deleted?)"
fi

# ====================================================================
# DELETE MISPLACED WORKSPACE FILE
# ====================================================================

if [ -f "src/into-the-wild.code-workspace" ]; then
    rm "src/into-the-wild.code-workspace"
    echo -e "  ${GREEN}✓${NC} Deleted: src/into-the-wild.code-workspace"
    DELETED_FILES=$((DELETED_FILES + 1))
else
    echo -e "  ${YELLOW}⊘${NC} Not found: src workspace file (already deleted?)"
fi

# ====================================================================
# DELETE OLD TREK FORM
# ====================================================================

if [ -f "src/components/trek/CreateTrekMultiStepForm.tsx" ]; then
    rm "src/components/trek/CreateTrekMultiStepForm.tsx"
    echo -e "  ${GREEN}✓${NC} Deleted: CreateTrekMultiStepForm.tsx (old version)"
    DELETED_FILES=$((DELETED_FILES + 1))
else
    echo -e "  ${YELLOW}⊘${NC} Not found: Old trek form (already deleted?)"
fi

echo ""

# ====================================================================
# CLEAN ARCHIVE FOLDERS
# ====================================================================

echo -e "${BLUE}📁 Cleaning archive folders...${NC}"

if [ -d "database-archive" ]; then
    rm -rf "database-archive"
    echo -e "  ${GREEN}✓${NC} Deleted: database-archive/ (25+ files)"
    DELETED_FILES=$((DELETED_FILES + 1))
else
    echo -e "  ${YELLOW}⊘${NC} Not found: database-archive/ (already deleted?)"
fi

if [ -d "db" ]; then
    rm -rf "db"
    echo -e "  ${GREEN}✓${NC} Deleted: db/ folder"
    DELETED_FILES=$((DELETED_FILES + 1))
else
    echo -e "  ${YELLOW}⊘${NC} Not found: db/ (already deleted?)"
fi

echo ""

# ====================================================================
# REMOVE DIST FROM GIT
# ====================================================================

echo -e "${BLUE}🚫 Removing dist/ from git tracking...${NC}"

if git ls-files --error-unmatch dist/ > /dev/null 2>&1; then
    git rm -r --cached dist/ > /dev/null 2>&1 || true
    echo -e "  ${GREEN}✓${NC} Removed dist/ from git (kept local files)"
else
    echo -e "  ${YELLOW}⊘${NC} dist/ not tracked by git"
fi

echo ""

# ====================================================================
# CHECK CONSOLE.LOGS
# ====================================================================

echo -e "${BLUE}🔍 Checking for console.log statements...${NC}"

CONSOLE_COUNT=$(grep -r "console\.log" src/ 2>/dev/null | wc -l | tr -d ' ')

if [ "$CONSOLE_COUNT" -gt 0 ]; then
    echo -e "  ${YELLOW}⚠️  Found $CONSOLE_COUNT console.log statements${NC}"
    echo -e "  ${YELLOW}   Manual cleanup required before production!${NC}"
    echo ""
    echo "  Top files with console.logs:"
    grep -r "console\.log" src/ 2>/dev/null | cut -d: -f1 | sort | uniq -c | sort -rn | head -5 | while read count file; do
        echo -e "    ${YELLOW}•${NC} $file ($count logs)"
    done
else
    echo -e "  ${GREEN}✓${NC} No console.log statements found!"
fi

echo ""

# ====================================================================
# SUMMARY
# ====================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✨ Cleanup Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "  Files deleted:     $DELETED_FILES"
if [[ $CREATE_BACKUP =~ ^[Yy]$ ]]; then
    echo "  Files backed up:   $BACKED_UP_FILES"
    echo "  Backup location:   $BACKUP_DIR"
fi
echo "  Console.logs:      $CONSOLE_COUNT (manual cleanup needed)"
echo ""

# ====================================================================
# NEXT STEPS
# ====================================================================

echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "  1. Review changes:"
echo "     ${YELLOW}git status${NC}"
echo ""
echo "  2. Update .gitignore (manual):"
echo "     Add: .env, .env.local, *.code-workspace"
echo ""
echo "  3. Remove console.logs:"
echo "     ${YELLOW}grep -rn 'console\.log' src/${NC}"
echo ""
echo "  4. Test build:"
echo "     ${YELLOW}npm run build${NC}"
echo ""
echo "  5. Commit changes:"
echo "     ${YELLOW}git add .${NC}"
echo "     ${YELLOW}git commit -m 'chore: pre-deployment cleanup'${NC}"
echo ""

# ====================================================================
# WARNINGS
# ====================================================================

if [ "$CONSOLE_COUNT" -gt 0 ]; then
    echo -e "${RED}⚠️  WARNING: Console.log cleanup still required!${NC}"
    echo ""
fi

echo -e "${GREEN}✅ Cleanup completed successfully!${NC}"
echo ""

exit 0


