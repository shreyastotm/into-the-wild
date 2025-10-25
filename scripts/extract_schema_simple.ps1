# Simple Database Schema Extraction Script (PowerShell)

param(
    [string]$OutputDir = "database-schema"
)

Write-Host "🏗️  Extracting latest database schema..." -ForegroundColor Green

# Create output directory
if (!(Test-Path $OutputDir)) {
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

# Check if Supabase is running
try {
    $null = npx supabase status 2>$null
} catch {
    Write-Host "❌ Supabase is not running. Please start it with: npx supabase start" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Extracting complete schema dump..." -ForegroundColor Yellow
npx supabase db dump --schema-only --data-only=false | Out-File -FilePath "$OutputDir\latest_schema.sql" -Encoding UTF8

Write-Host "📜 Getting migration history..." -ForegroundColor Yellow
npx supabase migration list | Out-File -FilePath "$OutputDir\migration_history.txt" -Encoding UTF8

# Create a simple summary
$readmeContent = @"
# Database Schema Summary

Generated on: $(Get-Date -Format "yyyy-MM-ddTHH:mm:ssZ")

## Files Generated:
- latest_schema.sql - Complete schema dump
- migration_history.txt - List of applied migrations

## Usage:
To apply this schema to a fresh database:
```bash
psql -d your_database -f latest_schema.sql
```
"@

$readmeContent | Out-File -FilePath "$OutputDir\README.md" -Encoding UTF8

Write-Host ""
Write-Host "✅ Schema extraction completed successfully!" -ForegroundColor Green
Write-Host "📁 Files generated in: $OutputDir/" -ForegroundColor Cyan
Write-Host "   - latest_schema.sql (Complete schema)" -ForegroundColor White
Write-Host "   - migration_history.txt (Migration list)" -ForegroundColor White
Write-Host "   - README.md (Summary)" -ForegroundColor White

