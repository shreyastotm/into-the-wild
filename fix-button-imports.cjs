const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Button imports across all components...\n');

// Files that need Button imports
const needsButtonImport = [
  'src/components/Header.tsx',
  'src/components/navigation/MobileHamburger.tsx',
  'src/components/ui/NotificationBell.tsx',
  'src/components/StaticBottomButton.tsx',
  'src/components/auth/SignInForm.tsx',
  'src/components/auth/SignUpForm.tsx',
  'src/pages/Index.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/TrekEvents.tsx',
  'src/pages/Gallery.tsx',
  'src/pages/admin/TrekEventsAdmin.tsx'
];

// Ensure Button imports in all necessary files
needsButtonImport.forEach(file => {
  try {
    const fullPath = path.join('.', file);
    if (!fs.existsSync(fullPath)) {
      console.log(`  ⚠️ ${file} - File does not exist, skipping`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');

    // Check if Button is already imported
    const hasButtonImport = /import.*Button.*from ["']@\/components\/ui\/button["']/.test(content);

    if (!hasButtonImport) {
      // Add Button import after other imports
      const lines = content.split('\n');
      let insertIndex = 0;

      // Find the last import statement
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import') && !lines[i].trim().startsWith('//')) {
          insertIndex = i + 1;
        } else if (lines[i].trim() === '' && i > 0 && lines[i-1].trim().startsWith('import')) {
          insertIndex = i;
          break;
        }
      }

      // Insert Button import
      lines.splice(insertIndex, 0, 'import { Button } from "@/components/ui/button";');

      content = lines.join('\n');
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`  ✅ ${file} - Added Button import`);
    } else {
      console.log(`  ℹ️ ${file} - Button import already exists`);
    }
  } catch (error) {
    console.error(`  ❌ ${file} - Error: ${error.message}`);
  }
});

// Fix destructuring issues in Supabase queries
const fixDestructuring = [
  'src/components/dashboard/UserTreks.tsx',
  'src/components/trek/TrekCostsManager.tsx',
  'src/hooks/trek/useTrekCosts.ts',
  'src/hooks/useExpenseSplitting.ts',
  'src/lib/adminUtils.ts',
  'src/components/trek/create/PackingListStep.tsx'
];

fixDestructuring.forEach(file => {
  try {
    const fullPath = path.join('.', file);
    if (!fs.existsSync(fullPath)) {
      console.log(`  ⚠️ ${file} - File does not exist, skipping`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');

    // Fix missing error in destructuring
    content = content.replace(/const\s*\{\s*data\s*\}\s*=\s*await\s+supabase/g, 'const { data, error } = await supabase');
    
    // Add error checking after supabase calls
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('const { data, error } = await supabase') && 
          i + 1 < lines.length && 
          !lines[i+1].trim().startsWith('if (error)')) {
        lines.splice(i + 1, 0, '  if (error) throw error;');
      }
    }

    content = lines.join('\n');
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  ✅ ${file} - Fixed destructuring and error handling`);
  } catch (error) {
    console.error(`  ❌ ${file} - Error: ${error.message}`);
  }
});

console.log('\n🎉 Button imports and destructuring fixed!');
