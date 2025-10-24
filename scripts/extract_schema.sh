#!/bin/bash

# Database Schema Extraction Script
# This script extracts the latest database schema from Supabase

set -e

# Configuration
OUTPUT_DIR="database-schema"
SCHEMA_FILE="latest_schema.sql"
TYPES_FILE="schema_types.sql"
FUNCTIONS_FILE="schema_functions.sql"
POLICIES_FILE="schema_policies.sql"

echo "🏗️  Extracting latest database schema..."

# Create output directory
mkdir -p "$OUTPUT_DIR"

# Check if Supabase CLI is available
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js and npm."
    exit 1
fi

# Check if Supabase is running
if ! npx supabase status &> /dev/null; then
    echo "❌ Supabase is not running. Please start it with: npx supabase start"
    exit 1
fi

echo "📋 Extracting complete schema dump..."
npx supabase db dump --schema-only --data-only=false > "$OUTPUT_DIR/$SCHEMA_FILE"

echo "🗂️  Extracting table structures..."
npx supabase db dump --schema-only --data-only=false --table="public.*" > "$OUTPUT_DIR/tables_only.sql"

echo "🏷️  Extracting custom types..."
npx supabase db dump --schema-only --data-only=false | grep -E "(CREATE TYPE|DROP TYPE|ALTER TYPE)" > "$OUTPUT_DIR/$TYPES_FILE" || true

echo "⚙️  Extracting functions..."
npx supabase db dump --schema-only --data-only=false | grep -A 50 -E "(CREATE FUNCTION|CREATE OR REPLACE FUNCTION)" > "$OUTPUT_DIR/$FUNCTIONS_FILE" || true

echo "🔒 Extracting RLS policies..."
npx supabase db dump --schema-only --data-only=false | grep -A 10 -E "(CREATE POLICY|DROP POLICY|ALTER TABLE.*ENABLE ROW LEVEL SECURITY)" > "$OUTPUT_DIR/$POLICIES_FILE" || true

echo "📜 Getting migration history..."
npx supabase migration list > "$OUTPUT_DIR/migration_history.txt"

# Create a comprehensive summary
cat > "$OUTPUT_DIR/README.md" << EOF
# Database Schema Summary

Generated on: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

## Files Generated:
- \`$SCHEMA_FILE\` - Complete schema dump with all tables, types, functions, and policies
- \`$TYPES_FILE\` - Custom types and enums only
- \`$FUNCTIONS_FILE\` - Database functions only  
- \`$POLICIES_FILE\` - RLS policies only
- \`tables_only.sql\` - Table structures only
- \`migration_history.txt\` - List of applied migrations

## Key Tables:
- \`users\` - User profiles and authentication
- \`trek_events\` - Trek event definitions
- \`trek_registrations\` - User registrations for treks
- \`trek_comments\` - Comments on treks
- \`trek_ratings\` - User ratings for treks
- \`trek_expenses\` - Expense tracking
- \`notifications\` - User notifications
- \`forum_*\` - Forum system tables

## Usage:
To apply this schema to a fresh database:
\`\`\`bash
# Apply the complete schema
psql -d your_database -f $SCHEMA_FILE

# Or apply individual components
psql -d your_database -f $TYPES_FILE
psql -d your_database -f $FUNCTIONS_FILE
psql -d your_database -f $POLICIES_FILE
\`\`\`
EOF

echo ""
echo "✅ Schema extraction completed successfully!"
echo "📁 Files generated in: $OUTPUT_DIR/"
echo "   - $SCHEMA_FILE (Complete schema)"
echo "   - $TYPES_FILE (Types only)"
echo "   - $FUNCTIONS_FILE (Functions only)"
echo "   - $POLICIES_FILE (Policies only)"
echo "   - tables_only.sql (Tables only)"
echo "   - migration_history.txt (Migration list)"
echo "   - README.md (Summary)"
