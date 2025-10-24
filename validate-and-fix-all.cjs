const fs = require('fs');
const path = require('path');

function validateAndFixFile(file) {
  try {
    const fullPath = path.join('.', file);
    const content = fs.readFileSync(fullPath, 'utf8');

    // Check for various broken patterns
    const hasBrokenImports = /import\s*\{\s*\n?\s*import\s+React/g.test(content) ||
                            /import.*React.*import/g.test(content) ||
                            /import.*import.*React/g.test(content);

    const hasDuplicateImports = /import React.*\n.*import React/g.test(content);

    if (hasBrokenImports || hasDuplicateImports) {
      console.log(`  🔧 Fixing ${file}...`);

      // Remove all malformed React imports
      let cleanContent = content
        .replace(/import\s*\{\s*\n?\s*import\s+React,\s*\{\s*[^}]+\s*\}\s+from\s+["']react["']\s*;\s*\n?/g, '')
        .replace(/import\s+React,\s*\{\s*[^}]+\s*\}\s+from\s+["']react["']\s*;\s*\n?\s*import\s*\{\s*[^}]*\s*\}\s+from/g, '');

      // Remove duplicate React imports
      const lines = cleanContent.split('\n');
      const uniqueLines = [];
      const seenImports = new Set();

      for (const line of lines) {
        if (line.trim().startsWith('import React')) {
          if (!seenImports.has(line.trim())) {
            seenImports.add(line.trim());
            uniqueLines.push(line);
          }
        } else {
          uniqueLines.push(line);
        }
      }

      cleanContent = uniqueLines.join('\n');

      // Determine what React import to add
      const usesHooks = /React\.(useState|useEffect|useCallback|useMemo|useRef|useContext)/.test(cleanContent);
      const usesComponents = /React\.(Component|FC|forwardRef)/.test(cleanContent);
      const usesClassComponent = /class.*extends.*React\.Component/.test(cleanContent);

      let reactImport;
      if (usesHooks) {
        reactImport = 'import React, { useState, useEffect } from "react";';
      } else if (usesComponents || usesClassComponent) {
        reactImport = 'import React, { Component } from "react";';
      } else {
        reactImport = 'import React from "react";';
      }

      // Check if React is already properly imported
      const hasProperReactImport = /^import.*React.*from ['"]react['"]/.test(cleanContent);

      if (!hasProperReactImport) {
        // Find where to insert React import
        let insertIndex = 0;
        for (let i = 0; i < uniqueLines.length; i++) {
          if (uniqueLines[i].trim().startsWith('import')) {
            insertIndex = i + 1;
          } else if (uniqueLines[i].trim() === '' && i > 0 && uniqueLines[i-1].trim().startsWith('import')) {
            insertIndex = i + 1;
            break;
          }
        }

        // Insert React import
        uniqueLines.splice(insertIndex, 0, reactImport, '');
        cleanContent = uniqueLines.join('\n');
      }

      fs.writeFileSync(fullPath, cleanContent, 'utf8');
      return true;
    }

    return false;
  } catch (error) {
    console.error(`  ❌ Error with ${file}: ${error.message}`);
    return false;
  }
}

function validateAndFixAll() {
  // Read the missing imports JSON
  const missingImportsData = fs.readFileSync('missing-react-imports.json', 'utf8');
  const missingImports = JSON.parse(missingImportsData);

  console.log(`🔍 Validating and fixing ${missingImports.length} files...\n`);

  let fixedCount = 0;
  let alreadyGoodCount = 0;

  missingImports.forEach(({ file }) => {
    if (validateAndFixFile(file)) {
      fixedCount++;
      console.log(`  ✅ ${file} - Fixed`);
    } else {
      alreadyGoodCount++;
      console.log(`  ✓ ${file} - Already good`);
    }
  });

  console.log(`\n📊 RESULTS:`);
  console.log(`✅ Fixed: ${fixedCount} files`);
  console.log(`✓ Already good: ${alreadyGoodCount} files`);
  console.log(`\n🎉 Validation and fixes completed!`);
}

// Run the validation and fix
validateAndFixAll();
