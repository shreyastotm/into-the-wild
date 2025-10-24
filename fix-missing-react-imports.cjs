const fs = require('fs');
const path = require('path');

function determineReactImport(content) {
  // Check what React patterns are used
  const usesHooks = /React\.(useState|useEffect|useCallback|useMemo|useRef|useContext)/.test(content);
  const usesComponents = /React\.(Component|FC|forwardRef)/.test(content);
  const usesClassComponent = /class.*extends.*React\.Component/.test(content);
  const usesCreateContext = /React\.createContext/.test(content);

  // Determine the most appropriate import
  if (usesHooks) {
    return 'import React, { useState, useEffect } from "react";';
  } else if (usesComponents || usesClassComponent) {
    return 'import React, { Component } from "react";';
  } else if (usesCreateContext) {
    return 'import React, { createContext } from "react";';
  } else {
    // Default to full React import for JSX or other patterns
    return 'import React from "react";';
  }
}

function fixMissingReactImports() {
  // Read the missing imports JSON
  const missingImportsData = fs.readFileSync('missing-react-imports.json', 'utf8');
  const missingImports = JSON.parse(missingImportsData);

  console.log(`🔧 Fixing ${missingImports.length} files missing React imports...\n`);

  let fixedCount = 0;
  let errorCount = 0;

  missingImports.forEach(({ file, usesJSX, usesReact }, index) => {
    try {
      const fullPath = path.join('.', file);
      const content = fs.readFileSync(fullPath, 'utf8');

      // Determine appropriate React import
      const reactImport = determineReactImport(content);

      // Check if React is already imported (double-check)
      const hasReactImport = /^import.*React.*from ['"]react['"]/.test(content);

      if (hasReactImport) {
        console.log(`  ⚠️  ${file} - React already imported, skipping`);
        return;
      }

      // Add React import after any existing imports or at the top
      let newContent;
      const lines = content.split('\n');

      // Find the last import line
      let insertIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].trim().startsWith('import')) {
          insertIndex = i + 1;
        } else if (lines[i].trim() === '' && lines[i-1] && lines[i-1].trim().startsWith('import')) {
          // Empty line after imports
          insertIndex = i + 1;
        }
      }

      // Insert React import
      lines.splice(insertIndex, 0, reactImport, '');

      newContent = lines.join('\n');

      // Write back to file
      fs.writeFileSync(fullPath, newContent, 'utf8');

      console.log(`  ✅ ${file} - Added: ${reactImport}`);
      fixedCount++;

    } catch (error) {
      console.error(`  ❌ ${file} - Error: ${error.message}`);
      errorCount++;
    }
  });

  console.log(`\n📊 RESULTS:`);
  console.log(`✅ Successfully fixed: ${fixedCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
  console.log(`\n🎉 React import fixes completed!`);
}

// Run the fix
fixMissingReactImports();
