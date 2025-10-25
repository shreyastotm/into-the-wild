@echo off
REM Database Schema Extraction Script (Windows Batch)
REM This script extracts the latest database schema from Supabase

set OUTPUT_DIR=database-schema
set SCHEMA_FILE=latest_schema.sql

echo 🏗️  Extracting latest database schema...

REM Create output directory
if not exist "%OUTPUT_DIR%" mkdir "%OUTPUT_DIR%"

REM Check if Supabase is running
npx supabase status >nul 2>&1
if errorlevel 1 (
    echo ❌ Supabase is not running. Please start it with: npx supabase start
    exit /b 1
)

echo 📋 Extracting complete schema dump...
npx supabase db dump --schema-only --data-only=false > "%OUTPUT_DIR%\%SCHEMA_FILE%"

echo 📜 Getting migration history...
npx supabase migration list > "%OUTPUT_DIR%\migration_history.txt"

REM Create a simple summary
echo # Database Schema Summary > "%OUTPUT_DIR%\README.md"
echo. >> "%OUTPUT_DIR%\README.md"
echo Generated on: %DATE% %TIME% >> "%OUTPUT_DIR%\README.md"
echo. >> "%OUTPUT_DIR%\README.md"
echo ## Files Generated: >> "%OUTPUT_DIR%\README.md"
echo - latest_schema.sql - Complete schema dump >> "%OUTPUT_DIR%\README.md"
echo - migration_history.txt - List of applied migrations >> "%OUTPUT_DIR%\README.md"
echo. >> "%OUTPUT_DIR%\README.md"
echo ## Usage: >> "%OUTPUT_DIR%\README.md"
echo To apply this schema to a fresh database: >> "%OUTPUT_DIR%\README.md"
echo ```bash >> "%OUTPUT_DIR%\README.md"
echo psql -d your_database -f latest_schema.sql >> "%OUTPUT_DIR%\README.md"
echo ``` >> "%OUTPUT_DIR%\README.md"

echo.
echo ✅ Schema extraction completed successfully!
echo 📁 Files generated in: %OUTPUT_DIR%/
echo    - %SCHEMA_FILE% (Complete schema)
echo    - migration_history.txt (Migration list)
echo    - README.md (Summary)

