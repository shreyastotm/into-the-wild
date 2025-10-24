# Database Schema Extraction Script (PowerShell)
# This script extracts the latest database schema from Supabase

param(
    [string]$OutputDir = "database-schema"
)

# Configuration
$SchemaFile = "latest_schema.sql"
$TypesFile = "schema_types.sql"
$FunctionsFile = "schema_functions.sql"
$PoliciesFile = "schema_policies.sql"

Write-Host "🏗️  Extracting latest database schema..." -ForegroundColor Green

# Create output directory
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Check if Supabase CLI is available
try {
    $null = Get-Command npx -ErrorAction Stop
} catch {
    Write-Host "❌ npx not found. Please install Node.js and npm." -ForegroundColor Red
    exit 1
}

# Check if Supabase is running
try {
    $null = npx supabase status 2>$null
} catch {
    Write-Host "❌ Supabase is not running. Please start it with: npx supabase start" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Extracting complete schema dump..." -ForegroundColor Yellow
npx supabase db dump --schema-only --data-only=false | Out-File -FilePath "$OutputDir\$SchemaFile" -Encoding UTF8

Write-Host "🗂️  Extracting table structures..." -ForegroundColor Yellow
npx supabase db dump --schema-only --data-only=false --table="public.*" | Out-File -FilePath "$OutputDir\tables_only.sql" -Encoding UTF8

Write-Host "🏷️  Extracting custom types..." -ForegroundColor Yellow
$typesOutput = npx supabase db dump --schema-only --data-only=false 2>$null | Select-String -Pattern "(CREATE TYPE|DROP TYPE|ALTER TYPE)"
if ($typesOutput) {
    $typesOutput | Out-File -FilePath "$OutputDir\$TypesFile" -Encoding UTF8
}

Write-Host "⚙️  Extracting functions..." -ForegroundColor Yellow
$functionsOutput = npx supabase db dump --schema-only --data-only=false 2>$null | Select-String -Pattern "(CREATE FUNCTION|CREATE OR REPLACE FUNCTION)" -Context 0,50
if ($functionsOutput) {
    $functionsOutput | Out-File -FilePath "$OutputDir\$FunctionsFile" -Encoding UTF8
}

Write-Host "🔒 Extracting RLS policies..." -ForegroundColor Yellow
$policiesOutput = npx supabase db dump --schema-only --data-only=false 2>$null | Select-String -Pattern "(CREATE POLICY|DROP POLICY|ALTER TABLE.*ENABLE ROW LEVEL SECURITY)" -Context 0,10
if ($policiesOutput) {
    $policiesOutput | Out-File -FilePath "$OutputDir\$PoliciesFile" -Encoding UTF8
}

Write-Host "📜 Getting migration history..." -ForegroundColor Yellow
npx supabase migration list | Out-File -FilePath "$OutputDir\migration_history.txt" -Encoding UTF8

# Create a comprehensive summary
$readmeContent = @"
# Database Schema Summary

Generated on: $(Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")

## Files Generated:
- `$SchemaFile` - Complete schema dump with all tables, types, functions, and policies
- `$TypesFile` - Custom types and enums only
- `$FunctionsFile` - Database functions only  
- `$PoliciesFile` - RLS policies only
- `tables_only.sql` - Table structures only
- `migration_history.txt` - List of applied migrations

## Key Tables:
- `users` - User profiles and authentication
- `trek_events` - Trek event definitions
- `trek_registrations` - User registrations for treks
- `trek_comments` - Comments on treks
- `trek_ratings` - User ratings for treks
- `trek_expenses` - Expense tracking
- `notifications` - User notifications
- `forum_*` - Forum system tables

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
```bash
# Apply the complete schema
psql -d your_database -f $SchemaFile

# Or apply individual components
psql -d your_database -f $TypesFile
psql -d your_database -f $FunctionsFile
psql -d your_database -f $PoliciesFile
```
"@

$readmeContent | Out-File -FilePath "$OutputDir\README.md" -Encoding UTF8

Write-Host ""
Write-Host "✅ Schema extraction completed successfully!" -ForegroundColor Green
Write-Host "📁 Files generated in: $OutputDir/" -ForegroundColor Cyan
Write-Host "   - $SchemaFile (Complete schema)" -ForegroundColor White
Write-Host "   - $TypesFile (Types only)" -ForegroundColor White
Write-Host "   - $FunctionsFile (Functions only)" -ForegroundColor White
Write-Host "   - $PoliciesFile (Policies only)" -ForegroundColor White
Write-Host "   - tables_only.sql (Tables only)" -ForegroundColor White
Write-Host "   - migration_history.txt (Migration list)" -ForegroundColor White
Write-Host "   - README.md (Summary)" -ForegroundColor White
