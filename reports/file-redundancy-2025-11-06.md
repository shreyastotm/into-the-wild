# File Redundancy Report

Generated: 2025-11-06T14:10:30.647Z

## Summary

- **Duplicate Scripts**: 2
- **Duplicate Docs**: 0
- **Backup Files**: 0

## Duplicate Scripts

### extract_schema
- Variants: extract_schema_simple.ps1, extract_schema.sh, extract_schema.ps1
- Recommended: extract_schema.ps1
- Reason: Multiple platform variants - consolidate to PowerShell

### extract_schema
- Variants: extract_schema.sh, extract_schema.ps1
- Recommended: extract_schema.ps1
- Reason: Multiple variants - consolidate to one

## Duplicate Documentation

✅ No duplicates found

## Backup Files

✅ No backup files found

## Recommendations

⚠️  Found 2 duplicate script groups:

   extract_schema:
     Variants: extract_schema_simple.ps1, extract_schema.sh, extract_schema.ps1
     Recommended: Keep extract_schema.ps1
     Reason: Multiple platform variants - consolidate to PowerShell

   extract_schema:
     Variants: extract_schema.sh, extract_schema.ps1
     Recommended: Keep extract_schema.ps1
     Reason: Multiple variants - consolidate to one
