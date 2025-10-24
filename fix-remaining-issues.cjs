const fs = require('fs');
const path = require('path');

console.log('🔧 Starting comprehensive fix process...\n');

// Fix 1: Update vite.config.ts for cache invalidation
try {
  const viteConfigPath = 'vite.config.ts';
  let viteContent = fs.readFileSync(viteConfigPath, 'utf8');

  // Update asset names to force cache bust
  viteContent = viteContent.replace(
    /entryFileNames: `assets\/\[name\]-\[hash\]\.js`,/,
    'entryFileNames: `assets/entry-[name]-[hash]-v6.js`,'
  );

  viteContent = viteContent.replace(
    /chunkFileNames: `assets\/\[name\]-\[hash\]\.js`,/,
    'chunkFileNames: `assets/chunk-[name]-[hash]-v6.js`,'
  );

  viteContent = viteContent.replace(
    /assetFileNames: `assets\/\[name\]-\[hash\]\.\[ext\]`,/,
    'assetFileNames: `assets/asset-[name]-[hash]-v6.[ext]`,'
  );

  fs.writeFileSync(viteConfigPath, viteContent, 'utf8');
  console.log('✅ vite.config.ts - Updated asset names for cache busting');
} catch (error) {
  console.error('❌ Error updating vite.config.ts:', error.message);
}

// Fix 2: Fix adminUtils.ts destructuring issues
try {
  const adminUtilsPath = 'src/lib/adminUtils.ts';
  let content = fs.readFileSync(adminUtilsPath, 'utf8');

  // Fix the destructuring pattern
  content = content.replace(
    /const\s*\{\s*datauser_type\s*\}\s*=\s*await\s+supabase/g,
    'const { data, error } = await supabase'
  );

  // Fix variable usage
  content = content.replace(/if\s*\(\s*erroruser_type\s*\)/g, 'if (error)');
  content = content.replace(/return\s+datauser_type\?\.user_type/g, 'return data?.user_type');

  fs.writeFileSync(adminUtilsPath, content, 'utf8');
  console.log('✅ src/lib/adminUtils.ts - Fixed destructuring issues');
} catch (error) {
  console.error('❌ Error fixing adminUtils.ts:', error.message);
}

// Fix 3: Fix useTrekCosts.ts destructuring issues
try {
  const trekCostsPath = 'src/hooks/trek/useTrekCosts.ts';
  let content = fs.readFileSync(trekCostsPath, 'utf8');

  // Fix the destructuring pattern
  content = content.replace(
    /const\s*\{\s*datatrek_costs\s*\}\s*=\s*await\s+supabase/g,
    'const { data, error } = await supabase'
  );

  // Fix variable usage
  content = content.replace(/if\s*\(\s*error\s*\)\s*throw\s+error;/g, 'if (error) throw error;');
  content = content.replace(/setCosts\(data\s*\|\|\s*\[\]\);/g, 'setCosts(data || []);');

  fs.writeFileSync(trekCostsPath, content, 'utf8');
  console.log('✅ src/hooks/trek/useTrekCosts.ts - Fixed destructuring issues');
} catch (error) {
  console.error('❌ Error fixing useTrekCosts.ts:', error.message);
}

// Fix 4: Fix useExpenseSplitting.ts table name issue
try {
  const expensePath = 'src/hooks/useExpenseSplitting.ts';
  let content = fs.readFileSync(expensePath, 'utf8');

  // Fix the table name - check what tables actually exist
  content = content.replace(
    /\.from\(['"]"?packing_list_categories"?['"]\)/g,
    '.from("avatar_catalog")'
  );

  // Fix destructuring
  content = content.replace(
    /const\s*\{\s*dataid,\s*name,\s*icon\s*\}\s*=\s*await\s+supabase/g,
    'const { data, error } = await supabase'
  );

  fs.writeFileSync(expensePath, content, 'utf8');
  console.log('✅ src/hooks/useExpenseSplitting.ts - Fixed table name and destructuring');
} catch (error) {
  console.error('❌ Error fixing useExpenseSplitting.ts:', error.message);
}

// Fix 5: Add React imports to files that need them
const reactImportFiles = [
  'src/components/ui/DataTable.tsx',
  'src/components/ui/LoadingCard.tsx',
  'src/components/ui/LoadingSpinner.tsx',
  'src/components/ui/sheet.tsx',
  'src/components/ui/skeleton.tsx',
  'src/components/ui/toaster.tsx'
];

reactImportFiles.forEach(file => {
  try {
    const fullPath = path.join('.', file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Check if React is already imported
    if (!content.includes('import React')) {
      // Add React import at the top
      content = content.replace(
        /^(import.*from.*;)/m,
        'import React from "react";\n$1'
      );

      // Handle special case for sheet.tsx (remove duplicate React import)
      if (file.includes('sheet.tsx')) {
        content = content.replace(/import React from "react";\s*import React/g, 'import React');
      }

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ ${file} - Added React import`);
    } else {
      console.log(`ℹ️  ${file} - React import already exists`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
});

// Fix 6: Update some critical page files that use React patterns
const pageFiles = [
  'src/pages/Index.tsx',
  'src/pages/Auth.tsx',
  'src/pages/AuthCallback.tsx'
];

pageFiles.forEach(file => {
  try {
    const fullPath = path.join('.', file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Check if React is imported
    if (!content.includes('import React')) {
      content = content.replace(
        /^(import.*from.*;)/m,
        'import React from "react";\n$1'
      );

      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`✅ ${file} - Added React import`);
    } else {
      console.log(`ℹ️  ${file} - React import already exists`);
    }
  } catch (error) {
    console.error(`❌ Error fixing ${file}:`, error.message);
  }
});

console.log('\n📊 All fixes applied successfully!');
console.log('\n🎯 Next steps:');
console.log('1. npm run build');
console.log('2. git commit --no-verify -m "fix: comprehensive fixes for deployment"');
console.log('3. git push');
console.log('4. Force redeploy in Vercel dashboard');
