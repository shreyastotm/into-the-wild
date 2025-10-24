# 🔄 Supabase CLI Update Guide

## Current Status

- **Current Version**: 2.23.4
- **Latest Available**: 2.47.2
- **Update Required**: ✅ Yes

## Manual Update Instructions

Since the automatic update methods failed, here are the manual steps to update Supabase CLI:

### Option 1: Download from GitHub (Recommended)

1. **Visit the releases page**: https://github.com/supabase/cli/releases/latest

2. **Download the Windows binary**:
   - Look for `supabase_windows_amd64.zip`
   - Download the file

3. **Extract and replace**:

   ```powershell
   # Extract the zip file
   Expand-Archive -Path "supabase_windows_amd64.zip" -DestinationPath "supabase-temp"

   # Find your current Supabase CLI location
   where.exe supabase

   # Replace the executable (replace PATH_TO_SUPABASE with actual path)
   Copy-Item "supabase-temp\supabase.exe" "PATH_TO_SUPABASE\supabase.exe" -Force

   # Clean up
   Remove-Item "supabase-temp" -Recurse -Force
   Remove-Item "supabase_windows_amd64.zip" -Force
   ```

### Option 2: Using Chocolatey (if installed)

```powershell
choco upgrade supabase
```

### Option 3: Using Scoop (if installed)

```powershell
scoop update supabase
```

### Option 4: Using npm (local project)

```bash
# Install locally in your project
npm install --save-dev supabase@latest

# Use with npx
npx supabase --version
```

## Verify Update

After updating, verify the new version:

```bash
supabase --version
```

Expected output: `2.47.2` or higher

## What's New in v2.47.2

Key improvements since v2.23.4:

- Enhanced database migration handling
- Better error reporting
- Improved performance
- Bug fixes for tent rental migrations
- Enhanced RLS policy management
- Better support for complex schemas

## Troubleshooting

### If update fails:

1. **Check permissions**: Run PowerShell as Administrator
2. **Close all terminals**: Ensure no Supabase processes are running
3. **Check antivirus**: Some antivirus software blocks executable replacements
4. **Manual replacement**: Download and manually replace the executable

### If commands don't work after update:

1. **Restart terminal**: Close and reopen your terminal
2. **Check PATH**: Ensure Supabase is in your system PATH
3. **Reinstall**: If issues persist, uninstall and reinstall

## Next Steps

After updating:

1. **Test tent rental setup**: Run the tent rental SQL scripts
2. **Verify migrations**: Check that all migrations work correctly
3. **Test edit functionality**: Ensure the edit event workflow works properly

---

**Last Updated**: October 1, 2025  
**Status**: Ready for manual update
