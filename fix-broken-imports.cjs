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

function fixBrokenImports() {
  // Read the missing imports JSON
  const missingImportsData = fs.readFileSync('missing-react-imports.json', 'utf8');
  const missingImports = JSON.parse(missingImportsData);

  console.log(`🔧 Fixing broken import statements in ${missingImports.length} files...\n`);

  let fixedCount = 0;
  let errorCount = 0;

  missingImports.forEach(({ file, usesJSX, usesReact }) => {
    try {
      const fullPath = path.join('.', file);
      const content = fs.readFileSync(fullPath, 'utf8');

      // Check for broken import pattern: import { ... } import React
      const brokenImportPattern = /import\s*\{\s*\n?\s*import\s+React/g;

      if (brokenImportPattern.test(content)) {
        // Remove all malformed React import lines
        const lines = content.split('\n');
        const cleanLines = lines.filter(line =>
          !line.includes('import React') ||
          !line.includes('import {') ||
          line.trim() === ''
        );

        // Determine appropriate React import
        const reactImport = determineReactImport(content);

        // Find where to insert the React import (after other imports)
        let insertIndex = 0;
        for (let i = 0; i < cleanLines.length; i++) {
          if (cleanLines[i].trim().startsWith('import')) {
            insertIndex = i + 1;
          } else if (cleanLines[i].trim() === '' && i > 0 && cleanLines[i-1].trim().startsWith('import')) {
            insertIndex = i + 1;
            break;
          }
        }

        // Insert React import
        cleanLines.splice(insertIndex, 0, reactImport, '');

        const newContent = cleanLines.join('\n');
        fs.writeFileSync(fullPath, newContent, 'utf8');

        console.log(`  ✅ ${file} - Fixed broken import, added: ${reactImport}`);
        fixedCount++;
      }

    } catch (error) {
      console.error(`  ❌ ${file} - Error: ${error.message}`);
      errorCount++;
    }
  });

  console.log(`\n📊 RESULTS:`);
  console.log(`✅ Successfully fixed: ${fixedCount} files`);
  console.log(`❌ Errors: ${errorCount} files`);
  console.log(`\n🎉 Broken import fixes completed!`);
}

// Run the fix
fixBrokenImports();
