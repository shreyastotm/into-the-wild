const fs = require('fs');
const path = require('path');

// Comprehensive mapping of files to their correct table names
const fileFixes = [
  {
    file: 'src/components/dashboard/UserTreks.tsx',
    tableName: 'trek_registrations',
    line: 58
  },
  {
    file: 'src/hooks/trek/useTrekCosts.ts',
    tableName: 'trek_costs',
    line: 26
  },
  {
    file: 'src/hooks/trek/useTrekEventDetails.ts',
    tableName: 'trek_events',
    line: 73
  },
  {
    file: 'src/hooks/trek/useTrekRatings.ts',
    tableName: 'trek_ratings',
    lines: [76, 157]
  },
  {
    file: 'src/hooks/trek/useTrekRegistration.ts',
    tableName: 'trek_registrations',
    line: 62
  },
  {
    file: 'src/pages/CreateTrekEvent.tsx',
    tableName: 'tent_inventory',
    line: 22
  },
  {
    file: 'src/components/admin/RegistrationAdmin.tsx',
    tableName: 'trek_registrations',
    line: 47
  },
  {
    file: 'src/components/admin/IdProofVerification.tsx',
    tableName: 'id_types',
    line: 67
  },
  {
    file: 'src/pages/admin/TrekEventsAdmin.tsx',
    tableName: 'trek_events',
    line: 438
  },
  {
    file: 'src/components/trek/TrekCostsManager.tsx',
    tableName: 'trek_costs',
    line: 51
  }
];

function fixSupabaseQueries() {
  console.log('🔧 Fixing ALL Supabase query issues...\n');

  let totalFixed = 0;
  let errors = [];

  fileFixes.forEach(({ file, tableName }) => {
    try {
      const fullPath = path.join('.', file);
      let content = fs.readFileSync(fullPath, 'utf8');
      let wasChanged = false;

      // Fix all variations of malformed .from() patterns
      const patterns = [
        /\.from\(['"]"?\*"?['"]\)/g,           // .from('"*"') or .from("*")
        /\.from\(['"]'?\*'?['"]\)/g,           // .from(''*'') or .from('*')
        /\.from\("\\"\*\\""\)/g,               // .from("\"*\"")
        /\.from\('\\'\*\\''\)/g,               // .from('\'*\'')
        /\.from\(['"]"\*"['"]\)/g,             // .from('"*"')
        /\.from\(['"]'\*'['"]\)/g              // .from(''*'')
      ];

      patterns.forEach(pattern => {
        if (pattern.test(content)) {
          content = content.replace(pattern, `.from("${tableName}")`);
          wasChanged = true;
        }
      });

      // Fix destructuring patterns - replace { datatrek_xxx } with { data, error }
      const destructurePattern = /const\s*\{\s*data[a-z_]+\s*\}\s*=\s*await\s+supabase/g;
      if (destructurePattern.test(content)) {
        content = content.replace(destructurePattern, 'const { data, error } = await supabase');
        wasChanged = true;
      }

      // Fix error variable patterns
      const errorPattern = /const\s*\{\s*error[a-z_]+\s*\}\s*=\s*await\s+supabase/g;
      if (errorPattern.test(content)) {
        content = content.replace(errorPattern, 'const { data, error } = await supabase');
        wasChanged = true;
      }

      if (wasChanged) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`  ✅ ${file} → Fixed to use "${tableName}"`);
        totalFixed++;
      } else {
        console.log(`  ℹ️  ${file} → No changes needed`);
      }

    } catch (error) {
      console.error(`  ❌ ${file} - Error: ${error.message}`);
      errors.push({ file, error: error.message });
    }
  });

  // Special case: TrekEvents.tsx uses "category" which should be trek_events
  try {
    const trekEventsPath = 'src/pages/TrekEvents.tsx';
    let content = fs.readFileSync(trekEventsPath, 'utf8');
    let wasChanged = false;
    
    // Fix .from('"category"') to trek_events
    if (content.includes('.from(\'"category"\')') || content.includes('.from("category")')) {
      content = content.replace(/\.from\(['"]"?category"?['"]\)/g, '.from("trek_events")');
      wasChanged = true;
    }

    // Fix destructuring
    if (content.includes('datatrek_events')) {
      content = content.replace(/const\s*\{\s*datatrek_events\s*\}/g, 'const { data, error }');
      wasChanged = true;
    }

    if (wasChanged) {
      fs.writeFileSync(trekEventsPath, content, 'utf8');
      console.log(`  ✅ ${trekEventsPath} → Fixed category query to trek_events`);
      totalFixed++;
    }
  } catch (error) {
    console.error(`  ❌ Error fixing TrekEvents.tsx: ${error.message}`);
    errors.push({ file: 'TrekEvents.tsx', error: error.message });
  }

  // Fix useExpenseSplitting.ts
  try {
    const expensePath = 'src/hooks/useExpenseSplitting.ts';
    let content = fs.readFileSync(expensePath, 'utf8');
    let wasChanged = false;

    if (content.includes('.from(\'"id, name, icon"\')')) {
      content = content.replace(/\.from\(['"]"?id,\s*name,\s*icon"?['"]\)/g, '.from("packing_list_categories")');
      wasChanged = true;
    }

    if (wasChanged) {
      fs.writeFileSync(expensePath, content, 'utf8');
      console.log(`  ✅ ${expensePath} → Fixed packing list query`);
      totalFixed++;
    }
  } catch (error) {
    console.error(`  ❌ Error fixing useExpenseSplitting.ts: ${error.message}`);
  }

  // Fix adminUtils.ts
  try {
    const adminUtilsPath = 'src/lib/adminUtils.ts';
    let content = fs.readFileSync(adminUtilsPath, 'utf8');
    let wasChanged = false;

    if (content.includes('.from(\'"user_type"\')')) {
      content = content.replace(/\.from\(['"]"?user_type"?['"]\)/g, '.from("users")');
      wasChanged = true;
    }

    if (wasChanged) {
      fs.writeFileSync(adminUtilsPath, content, 'utf8');
      console.log(`  ✅ ${adminUtilsPath} → Fixed user type query`);
      totalFixed++;
    }
  } catch (error) {
    console.error(`  ❌ Error fixing adminUtils.ts: ${error.message}`);
  }

  console.log(`\n📊 RESULTS:`);
  console.log(`✅ Successfully fixed: ${totalFixed} files`);
  if (errors.length > 0) {
    console.log(`❌ Errors encountered: ${errors.length} files`);
    errors.forEach(({ file, error }) => {
      console.log(`   - ${file}: ${error}`);
    });
  }
  console.log(`\n🎉 Supabase query fixes completed!`);
}

// Run the comprehensive fix
fixSupabaseQueries();

