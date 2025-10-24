const fs = require('fs');
const path = require('path');

function fixSupabaseQueries() {
  console.log('🔧 Fixing Supabase queries with $3 placeholders...\n');

  // List of files with $3 issues
  const filesToFix = [
    'src/components/trek/TrekCostsManager.tsx',
    'src/pages/admin/TrekEventsAdmin.tsx',
    'src/components/admin/IdProofVerification.tsx',
    'src/components/dashboard/UserTreks.tsx',
    'src/components/admin/RegistrationAdmin.tsx',
    'src/pages/TrekEvents.tsx',
    'src/pages/CreateTrekEvent.tsx',
    'src/lib/adminUtils.ts',
    'src/hooks/useExpenseSplitting.ts',
    'src/hooks/trek/useTrekRegistration.ts',
    'src/hooks/trek/useTrekRatings.ts',
    'src/hooks/trek/useTrekEventDetails.ts',
    'src/hooks/trek/useTrekCosts.ts',
    'src/components/trek/create/PackingListStep.tsx'
  ];

  let fixedCount = 0;

  filesToFix.forEach(file => {
    try {
      const fullPath = path.join('.', file);
      let content = fs.readFileSync(fullPath, 'utf8');

      // Fix various patterns of $3 usage
      let wasChanged = false;

      // Fix .select($3) patterns
      if (content.includes('.select($3)')) {
        content = content.replace(/\.select\(\$3\)/g, '.select("*")');
        wasChanged = true;
      }

      // Fix .select($3) in from('*') patterns
      if (content.includes('.from(\'*\'') && content.includes('.select($3)')) {
        content = content.replace(/\.from\('\*'\)\.select\(\$3\)/g, '.from("*").select("*")');
        wasChanged = true;
      }

      // Fix any remaining malformed patterns
      content = content.replace(/datatrek_costs/g, 'data');
      content = content.replace(/dataerror/g, 'error');
      content = content.replace(/\.select\(\$3\)/g, '.select("*")');

      if (wasChanged) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`  ✅ ${file} - Fixed Supabase queries`);
        fixedCount++;
      } else {
        console.log(`  ✓ ${file} - No changes needed`);
      }

    } catch (error) {
      console.error(`  ❌ ${file} - Error: ${error.message}`);
    }
  });

  console.log(`\n📊 RESULTS:`);
  console.log(`✅ Fixed: ${fixedCount} files`);
  console.log(`\n🎉 Supabase query fixes completed!`);
}

// Run the fix
fixSupabaseQueries();
