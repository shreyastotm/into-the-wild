const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing malformed Supabase table names...\n');

// Files with potential table name issues
const filesToFix = [
  'src/components/dashboard/UserTreks.tsx',
  'src/hooks/trek/useTrekRegistration.ts',
  'src/hooks/trek/useTrekCosts.ts',
  'src/components/trek/TrekCostsManager.tsx',
  'src/hooks/trek/useTrekEventDetails.ts',
  'src/pages/admin/TrekEventsAdmin.tsx',
  'src/hooks/trek/useTrekRatings.ts',
  'src/pages/CreateTrekEvent.tsx',
  'src/components/admin/IdProofVerification.tsx',
  'src/pages/TrekEvents.tsx'
];

// Map of correct table names
const tableNameMap = {
  'src/components/dashboard/UserTreks.tsx': 'trek_registrations',
  'src/hooks/trek/useTrekRegistration.ts': 'trek_registrations',
  'src/hooks/trek/useTrekCosts.ts': 'trek_costs',
  'src/components/trek/TrekCostsManager.tsx': 'trek_costs',
  'src/hooks/trek/useTrekEventDetails.ts': 'trek_events',
  'src/pages/admin/TrekEventsAdmin.tsx': 'trek_events',
  'src/hooks/trek/useTrekRatings.ts': 'trek_ratings',
  'src/pages/CreateTrekEvent.tsx': 'tent_inventory',
  'src/components/admin/IdProofVerification.tsx': 'id_types',
  'src/pages/TrekEvents.tsx': 'trek_events'
};

filesToFix.forEach(file => {
  try {
    const fullPath = path.join('.', file);
    if (!fs.existsSync(fullPath)) {
      console.log(`  ⚠️ ${file} - File does not exist, skipping`);
      return;
    }
    
    let content = fs.readFileSync(fullPath, 'utf8');
    const correctTableName = tableNameMap[file];
    
    // Fix malformed table names
    const patterns = [
      /\.from\(['"]"?\*"?['"]\)/g,
      /\.from\(['"]'?\*'?['"]\)/g,
      /\.from\("\\"\*\\""\)/g,
      /\.from\('\\'\*\\''\)/g,
      /\.from\(['"]"?category"?['"]\)/g,
      /\.from\(['"]"?id, name, category"?['"]\)/g
    ];
    
    let wasChanged = false;
    patterns.forEach(pattern => {
      if (pattern.test(content)) {
        content = content.replace(pattern, `.from("${correctTableName}")`);
        wasChanged = true;
      }
    });
    
    if (wasChanged) {
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`  ✅ ${file} - Fixed table name to "${correctTableName}"`);
    } else {
      console.log(`  ℹ️ ${file} - No malformed table names found`);
    }
  } catch (error) {
    console.error(`  ❌ ${file} - Error: ${error.message}`);
  }
});

console.log('\n🎉 Supabase table names fixed!');
