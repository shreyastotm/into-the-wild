const fs = require('fs');
const path = require('path');

function findMissingReactImports(dir) {
  const files = fs.readdirSync(dir, { recursive: true })
    .filter(file => file.endsWith('.tsx') || file.endsWith('.ts'))
    .map(file => path.join(dir, file));

  const missingImports = [];
  const properlyImported = [];

  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf8');

      // Skip if file doesn't use React patterns
      const usesReact = /React\.(useState|useEffect|useCallback|useMemo|Component|FC|createContext|forwardRef|useRef|useContext)/.test(content) ||
                       /class.*extends.*React\.Component/.test(content) ||
                       /React\.Component</.test(content);

      if (!usesReact) return;

      // Check for React import patterns
      const hasReactImport = /^import.*React.*from ['"]react['"]/.test(content) ||
                           /^import.*\{.*React.*\}.*from ['"]react['"]/.test(content) ||
                           /^import.*React.*\{/.test(content) ||
                           /import.*\{.*\}.*React.*from/.test(content);

      // Check for JSX usage (which requires React import in older versions)
      const usesJSX = /<[^>]*>.*<\/[^>]*>/.test(content) ||
                     /return \(/.test(content) && /<[^>]*>/.test(content);

      if (usesReact && !hasReactImport) {
        const relativePath = file.replace(dir + path.sep, '');
        missingImports.push({
          file: relativePath,
          usesJSX,
          usesReact,
          content: content.substring(0, 100) + '...'
        });
      } else if (usesReact && hasReactImport) {
        const relativePath = file.replace(dir + path.sep, '');
        properlyImported.push(relativePath);
      }
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
  });

  console.log(`\n📊 SUMMARY:`);
  console.log(`✅ Files with proper React imports: ${properlyImported.length}`);
  console.log(`❌ Files missing React imports: ${missingImports.length}`);

  if (missingImports.length > 0) {
    console.log(`\n🔧 FILES MISSING REACT IMPORTS (${missingImports.length}):`);
    missingImports.forEach(({ file, usesJSX, usesReact }) => {
      const type = usesJSX ? '[JSX]' : usesReact ? '[React API]' : '[Unknown]';
      console.log(`  ${type} ${file}`);
    });
  }

  return missingImports;
}

// Run the detection
console.log('🔍 Scanning for files missing React imports...\n');
const missingImports = findMissingReactImports('./src');

// Save results to file for later use
fs.writeFileSync('missing-react-imports.json', JSON.stringify(missingImports, null, 2));
console.log(`\n📝 Results saved to missing-react-imports.json`);
