// Fix unused imports script
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all TypeScript files
const getAllFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes('node_modules') && !filePath.includes('dist')) {
      getAllFiles(filePath, fileList);
    } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });

  return fileList;
};

// Fix unused imports in a file
const fixUnusedImports = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const newLines = [];
    
    let inImportBlock = false;
    let unusedImports = [];
    
    // First pass: collect unused imports
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line is an import
      if (line.trim().startsWith('import ')) {
        inImportBlock = true;
        
        // Check for unused imports (marked with TS6133)
        const nextLine = lines[i + 1] || '';
        if (nextLine.includes('TS6133') || nextLine.includes('is declared but its value is never read')) {
          const match = line.match(/import\s+{?\s*([^}]*)\s*}?\s+from/);
          if (match) {
            const importedItems = match[1].split(',').map(item => item.trim());
            unusedImports = [...unusedImports, ...importedItems];
          }
        }
      } else if (inImportBlock && !line.trim().startsWith('import ')) {
        inImportBlock = false;
      }
    }
    
    // Second pass: remove unused imports
    inImportBlock = false;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.trim().startsWith('import ')) {
        inImportBlock = true;
        
        // Check if this import has unused items
        let newLine = line;
        unusedImports.forEach(item => {
          // Remove the item from the import statement
          const regex = new RegExp(`\\b${item}\\b\\s*,?|,?\\s*\\b${item}\\b`, 'g');
          newLine = newLine.replace(regex, '');
        });
        
        // Clean up empty imports
        newLine = newLine.replace(/import\s*{\s*}\s*from/, 'import from');
        newLine = newLine.replace(/import\s*from/, '// import from');
        
        // Add the modified line
        if (newLine !== '// import from') {
          newLines.push(newLine);
        }
      } else {
        // Skip TS6133 error comments
        if (!(line.includes('TS6133') || line.includes('is declared but its value is never read'))) {
          newLines.push(line);
        }
      }
    }
    
    // Write the file back
    fs.writeFileSync(filePath, newLines.join('\n'));
    console.log(`Fixed: ${filePath}`);
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
};

// Main function
const main = () => {
  const srcDir = path.join(process.cwd(), 'src');
  const files = getAllFiles(srcDir);
  
  console.log(`Found ${files.length} TypeScript files to process`);
  
  // Get TypeScript errors
  try {
    const tscOutput = execSync('npx tsc --noEmit', { encoding: 'utf8' });
    console.log('TypeScript errors found, processing files...');
  } catch (error) {
    // tsc will exit with error if there are type errors, which is expected
    console.log('Processing files with TypeScript errors...');
  }
  
  // Process each file
  files.forEach(file => {
    fixUnusedImports(file);
  });
  
  console.log('Finished processing files');
};

main();
