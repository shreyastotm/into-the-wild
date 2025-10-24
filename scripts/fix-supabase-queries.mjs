// Fix Supabase Query TypeScript Errors
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

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

// Fix Supabase query type errors
const fixSupabaseQueries = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Fix type assertion on chained queries
    const chainedQueryPattern = /const\s+{\s*data(?:,\s*error)?\s*}\s*=\s*await\s+supabase\s*\.\s*from\s*\(\s*['"][^'"]+['"]\s*\)\s*\.\s*select\s*\([^)]*\)\s*(?:as\s+any\s*)?\n\s*\./g;
    
    if (chainedQueryPattern.test(content)) {
      // Replace with properly formatted query with type assertion at the end
      content = content.replace(
        /const\s+{\s*data(?:,\s*error)?\s*}\s*=\s*await\s+supabase\s*\.\s*from\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\.\s*select\s*\(([^)]*)\)(?:\s*as\s+any\s*)?\n\s*\./g,
        'const { data$1 } = await supabase\n        .from(\'$2\')\n        .select($3)\n        .'
      );
      
      // Add type assertion at the end of the chain
      content = content.replace(
        /\n\s*\.\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*;/g,
        '\n        .$1($2) as any;'
      );
      
      // Fix any remaining chained methods
      content = content.replace(
        /\n\s*\.\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([^)]*)\)\s*\n\s*\./g,
        '\n        .$1($2)\n        .'
      );
    }
    
    // Fix simple queries with type assertion
    content = content.replace(
      /const\s+{\s*data(?:,\s*error)?\s*}\s*=\s*await\s+supabase\s*\.\s*from\s*\(\s*['"]([^'"]+)['"]\s*\)\s*\.\s*select\s*\(([^)]*)\)(?:\s*as\s+any\s*)?;/g,
      'const { data$1 } = await supabase.from(\'$2\').select($3) as any;'
    );
    
    // Write the file back if modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed Supabase queries in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
};

// Main function
const main = async () => {
  const srcDir = path.join(rootDir, 'src');
  const files = getAllFiles(srcDir);
  
  console.log(`Found ${files.length} TypeScript files to process`);
  
  let fixedCount = 0;
  
  // Process each file
  files.forEach(file => {
    if (fixSupabaseQueries(file)) fixedCount++;
  });
  
  console.log(`Fixed Supabase queries in ${fixedCount} files`);
  console.log('Finished processing files');
};

main().catch(console.error);
