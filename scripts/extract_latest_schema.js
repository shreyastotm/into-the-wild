#!/usr/bin/env node

/**
 * Database Schema Extraction Script
 *
 * This script extracts the latest database schema from Supabase
 * and generates a comprehensive SQL file with the current state.
 *
 * Usage:
 *   node scripts/extract_latest_schema.js
 *
 * Requirements:
 *   - Supabase CLI installed and configured
 *   - Local Supabase instance running
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Configuration
const OUTPUT_DIR = "database-schema";
const SCHEMA_FILE = "latest_schema.sql";
const TYPES_FILE = "schema_types.sql";
const FUNCTIONS_FILE = "schema_functions.sql";
const POLICIES_FILE = "schema_policies.sql";

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log("🏗️  Extracting latest database schema...\n");

try {
  // 1. Extract complete schema dump
  console.log("📋 Extracting complete schema dump...");
  const schemaDump = execSync(
    "npx supabase db dump --schema-only --data-only=false",
    {
      encoding: "utf8",
      cwd: process.cwd(),
    },
  );

  // 2. Extract only table structures
  console.log("🗂️  Extracting table structures...");
  const tableDump = execSync(
    'npx supabase db dump --schema-only --data-only=false --table="public.*"',
    {
      encoding: "utf8",
      cwd: process.cwd(),
    },
  );

  // 3. Extract custom types
  console.log("🏷️  Extracting custom types...");
  const typesDump = execSync(
    'npx supabase db dump --schema-only --data-only=false --table="public.*" | grep -E "(CREATE TYPE|DROP TYPE|ALTER TYPE)"',
    {
      encoding: "utf8",
      cwd: process.cwd(),
      shell: true,
    },
  );

  // 4. Extract functions
  console.log("⚙️  Extracting functions...");
  const functionsDump = execSync(
    'npx supabase db dump --schema-only --data-only=false | grep -A 50 -E "(CREATE FUNCTION|CREATE OR REPLACE FUNCTION)"',
    {
      encoding: "utf8",
      cwd: process.cwd(),
      shell: true,
    },
  );

  // 5. Extract RLS policies
  console.log("🔒 Extracting RLS policies...");
  const policiesDump = execSync(
    'npx supabase db dump --schema-only --data-only=false | grep -A 10 -E "(CREATE POLICY|DROP POLICY|ALTER TABLE.*ENABLE ROW LEVEL SECURITY)"',
    {
      encoding: "utf8",
      cwd: process.cwd(),
      shell: true,
    },
  );

  // 6. Get migration history
  console.log("📜 Getting migration history...");
  const migrationHistory = execSync("npx supabase migration list", {
    encoding: "utf8",
    cwd: process.cwd(),
  });

  // Write main schema file
  const schemaContent = `-- Latest Database Schema
-- Generated on: ${new Date().toISOString()}
-- 
-- This file contains the complete current state of the database schema
-- including tables, types, functions, and RLS policies.

-- ==============================
-- MIGRATION HISTORY
-- ==============================
${migrationHistory}

-- ==============================
-- COMPLETE SCHEMA DUMP
-- ==============================

${schemaDump}

-- ==============================
-- TABLE STRUCTURES ONLY
-- ==============================

${tableDump}
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, SCHEMA_FILE), schemaContent);

  // Write types file
  const typesContent = `-- Custom Types and Enums
-- Generated on: ${new Date().toISOString()}

${typesDump}
`;
  fs.writeFileSync(path.join(OUTPUT_DIR, TYPES_FILE), typesContent);

  // Write functions file
  const functionsContent = `-- Database Functions
-- Generated on: ${new Date().toISOString()}

${functionsDump}
`;
  fs.writeFileSync(path.join(OUTPUT_DIR, FUNCTIONS_FILE), functionsContent);

  // Write policies file
  const policiesContent = `-- Row Level Security Policies
-- Generated on: ${new Date().toISOString()}

${policiesDump}
`;
  fs.writeFileSync(path.join(OUTPUT_DIR, POLICIES_FILE), policiesContent);

  // 7. Create a comprehensive summary
  const summaryContent = `# Database Schema Summary

Generated on: ${new Date().toISOString()}

## Files Generated:
- \`${SCHEMA_FILE}\` - Complete schema dump with all tables, types, functions, and policies
- \`${TYPES_FILE}\` - Custom types and enums only
- \`${FUNCTIONS_FILE}\` - Database functions only  
- \`${POLICIES_FILE}\` - RLS policies only

## Migration History:
\`\`\`
${migrationHistory}
\`\`\`

## Key Tables:
- \`users\` - User profiles and authentication
- \`trek_events\` - Trek event definitions
- \`trek_registrations\` - User registrations for treks
- \`trek_comments\` - Comments on treks
- \`trek_ratings\` - User ratings for treks
- \`trek_expenses\` - Expense tracking
- \`notifications\` - User notifications
- \`forum_*\` - Forum system tables

## Key Features:
- Row Level Security (RLS) enabled on all tables
- Custom types for user roles, transport modes, etc.
- Comprehensive notification system
- Forum and community features
- Expense sharing and tracking
- Rating and review system
- Packing list management
- Image and media management

## Usage:
To apply this schema to a fresh database:
\`\`\`bash
# Apply the complete schema
psql -d your_database -f ${SCHEMA_FILE}

# Or apply individual components
psql -d your_database -f ${TYPES_FILE}
psql -d your_database -f ${FUNCTIONS_FILE}
psql -d your_database -f ${POLICIES_FILE}
\`\`\`
`;

  fs.writeFileSync(path.join(OUTPUT_DIR, "README.md"), summaryContent);

  console.log("\n✅ Schema extraction completed successfully!");
  console.log(`📁 Files generated in: ${OUTPUT_DIR}/`);
  console.log(`   - ${SCHEMA_FILE} (Complete schema)`);
  console.log(`   - ${TYPES_FILE} (Types only)`);
  console.log(`   - ${FUNCTIONS_FILE} (Functions only)`);
  console.log(`   - ${POLICIES_FILE} (Policies only)`);
  console.log(`   - README.md (Summary)`);
} catch (error) {
  console.error("❌ Error extracting schema:", error.message);
  process.exit(1);
}
