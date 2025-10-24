const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing React import conflicts...\n');

// Files that need React imports (use React namespace or hooks)
const needsReactImport = [
  'src/components/auth/SignUpForm.tsx',
  'src/components/trek/TrekCostsManager.tsx',
  'src/components/admin/RegistrationAdmin.tsx',
  'src/components/admin/IdProofVerification.tsx',
  'src/components/dashboard/UserTreks.tsx',
  'src/components/trek/create/PackingListStep.tsx',
  'src/components/admin/StatusBadge.tsx',
  'src/components/trek/filters/SortSelect.tsx',
  'src/components/admin/BulkActions.tsx',
  'src/components/trek/TrekStatusBadge.tsx',
  'src/components/auth/SignInForm.tsx'
];

// Files that should NOT have React imports (shadcn/ui components)
const noReactImport = [
  'src/components/ui/DataTable.tsx',
  'src/components/ui/LoadingCard.tsx',
  'src/components/ui/LoadingSpinner.tsx',
  'src/components/ui/skeleton.tsx',
  'src/components/ui/toaster.tsx'
];

// Pages that need React imports
const pageNeedsReact = [
  'src/pages/Index.tsx',
  'src/pages/Auth.tsx',
  'src/pages/AuthCallback.tsx'
];

console.log('📝 Removing React imports from shadcn/ui components...');

// Remove React imports from shadcn/ui components
noReactImport.forEach(file => {
  try {
    const fullPath = path.join('.', file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Remove React import lines
    content = content.replace(/^import React.*from "react";?\s*$/gm, '');
    content = content.replace(/^import \* as React.*from "react";?\s*$/gm, '');
    content = content.replace(/^import React,.*from "react";?\s*$/gm, '');

    // Clean up extra blank lines
    content = content.replace(/\n\n\n+/g, '\n\n');

    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`  ✅ ${file} - Removed React import`);
  } catch (error) {
    console.error(`  ❌ ${file} - Error: ${error.message}`);
  }
});

console.log('\n📝 Ensuring React imports in components that need them...');

// Add React imports to components that actually need them
needsReactImport.forEach(file => {
  try {
    const fullPath = path.join('.', file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Check if React is already imported
    const hasReactImport = /^import.*React.*from "react"/.test(content);

    if (!hasReactImport) {
      // Add React import after other imports
      const lines = content.split('\n');
      let insertIndex = 0;

      // Find the last import statement
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import') && !lines[i].trim().startsWith('//')) {
          insertIndex = i + 1;
        }
      }

      // Insert React import
      lines.splice(insertIndex, 0, 'import React from "react";', '');

      content = lines.join('\n');
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`  ✅ ${file} - Added React import`);
    } else {
      console.log(`  ℹ️  ${file} - React import already exists`);
    }
  } catch (error) {
    console.error(`  ❌ ${file} - Error: ${error.message}`);
  }
});

console.log('\n📝 Ensuring React imports in pages...');

// Add React imports to pages that need them
pageNeedsReact.forEach(file => {
  try {
    const fullPath = path.join('.', file);
    let content = fs.readFileSync(fullPath, 'utf8');

    // Check if React is already imported
    const hasReactImport = /^import.*React.*from "react"/.test(content);

    if (!hasReactImport) {
      // Add React import after other imports
      const lines = content.split('\n');
      let insertIndex = 0;

      // Find the last import statement
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import') && !lines[i].trim().startsWith('//')) {
          insertIndex = i + 1;
        }
      }

      // Insert React import
      lines.splice(insertIndex, 0, 'import React from "react";', '');

      content = lines.join('\n');
      fs.writeFileSync(fullPath, content, 'utf8');
      console.log(`  ✅ ${file} - Added React import`);
    } else {
      console.log(`  ℹ️  ${file} - React import already exists`);
    }
  } catch (error) {
    console.error(`  ❌ ${file} - Error: ${error.message}`);
  }
});

console.log('\n🎉 React import conflicts fixed!');
console.log('\n📋 Next steps:');
console.log('1. npm run dev (should work now)');
console.log('2. npm run build');
console.log('3. git commit and push');
console.log('4. Check production site');
