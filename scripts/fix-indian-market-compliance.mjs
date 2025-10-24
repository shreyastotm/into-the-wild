// Fix Indian Market Compliance Issues
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Get all TypeScript and TSX files
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

// Fix currency references
const fixCurrencyReferences = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Replace USD/$ references with ₹
    const replacements = [
      // Replace $ with ₹
      { pattern: /\$(\d+)/g, replacement: '₹$1' },
      { pattern: /\$\s*(\d+)/g, replacement: '₹$1' },
      
      // Replace USD with INR
      { pattern: /USD/g, replacement: 'INR' },
      { pattern: /\bUSD\s+(\d+)/g, replacement: '₹$1' },
      
      // Replace EUR/GBP with INR
      { pattern: /EUR/g, replacement: 'INR' },
      { pattern: /GBP/g, replacement: 'INR' },
      { pattern: /\bEUR\s+(\d+)/g, replacement: '₹$1' },
      { pattern: /\bGBP\s+(\d+)/g, replacement: '₹$1' },
      
      // Fix currency formatting function calls
      { pattern: /formatCurrency\(([^,)]+)(?:,\s*['"]USD['"])?\)/g, replacement: 'formatCurrency($1, "INR")' },
      { pattern: /formatCurrency\(([^,)]+)(?:,\s*['"]EUR['"])?\)/g, replacement: 'formatCurrency($1, "INR")' },
      { pattern: /formatCurrency\(([^,)]+)(?:,\s*['"]GBP['"])?\)/g, replacement: 'formatCurrency($1, "INR")' },
      
      // Replace hardcoded currency symbols in JSX
      { pattern: /<[^>]*>\s*\$\s*(\d+)/g, replacement: '<>₹$1' },
      
      // Fix currency display in templates
      { pattern: /`\$\{([^}]+)\}`/g, replacement: '`₹${$1}`' },
    ];
    
    // Apply all replacements
    replacements.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement);
    });
    
    // Write the file back if modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed currency in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
};

// Fix date formatting
const fixDateFormatting = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Replace MM/DD/YYYY with DD/MM/YYYY
    const replacements = [
      // Replace date format strings
      { pattern: /'MM\/DD\/YYYY'/g, replacement: "'DD/MM/YYYY'" },
      { pattern: /"MM\/DD\/YYYY"/g, replacement: '"DD/MM/YYYY"' },
      { pattern: /format\(.*?,\s*['"]MM\/DD\/YYYY['"]\)/g, replacement: (match) => match.replace('MM/DD/YYYY', 'DD/MM/YYYY') },
      
      // Replace date-fns format calls
      { pattern: /format\(([^,]+),\s*['"]MM\/dd\/yyyy['"]\)/g, replacement: 'format($1, "dd/MM/yyyy")' },
      { pattern: /format\(([^,]+),\s*['"]M\/d\/yyyy['"]\)/g, replacement: 'format($1, "d/M/yyyy")' },
      
      // Add formatIndianDate function calls
      { pattern: /format\(([^,]+),\s*['"]([^'"]*)['"]\)/g, replacement: (match, date, format) => {
        if (format.includes('MM') || format.includes('dd') || format.includes('yyyy')) {
          return `formatIndianDate(${date})`;
        }
        return match;
      }},
    ];
    
    // Apply all replacements
    replacements.forEach(({ pattern, replacement }) => {
      content = content.replace(pattern, replacement);
    });
    
    // Add import for formatIndianDate if needed
    if (content !== originalContent && content.includes('formatIndianDate') && !content.includes('import { formatIndianDate }')) {
      content = `import { formatIndianDate } from '@/utils/indianStandards';\n${content}`;
    }
    
    // Write the file back if modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed date formatting in: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
};

// Fix GST calculations
const fixGSTCalculations = (filePath) => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    
    // Check if file contains price/cost calculations without GST
    if ((content.includes('price') || content.includes('cost') || content.includes('amount')) && 
        !content.includes('GST') && !content.includes('gst')) {
      
      // Add GST calculations to price/cost variables
      const replacements = [
        // Add GST calculation to price assignments
        { 
          pattern: /(const|let|var)\s+(\w+Price)\s*=\s*(\d+|[a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)/g, 
          replacement: '$1 $2 = calculateGSTPrice($3)' 
        },
        // Add GST calculation to cost assignments
        { 
          pattern: /(const|let|var)\s+(\w+Cost)\s*=\s*(\d+|[a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)/g, 
          replacement: '$1 $2 = calculateGSTPrice($3)' 
        },
        // Add GST calculation to amount assignments
        { 
          pattern: /(const|let|var)\s+(\w+Amount)\s*=\s*(\d+|[a-zA-Z_$][a-zA-Z0-9_$]*(?:\.[a-zA-Z_$][a-zA-Z0-9_$]*)*)/g, 
          replacement: '$1 $2 = calculateGSTPrice($3)' 
        },
      ];
      
      // Apply all replacements
      replacements.forEach(({ pattern, replacement }) => {
        content = content.replace(pattern, replacement);
      });
      
      // Add import for calculateGSTPrice if needed
      if (content !== originalContent && content.includes('calculateGSTPrice') && !content.includes('import { calculateGSTPrice }')) {
        content = `import { calculateGSTPrice } from '@/utils/indianStandards';\n${content}`;
      }
    }
    
    // Write the file back if modified
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content);
      console.log(`Fixed GST calculations in: ${filePath}`);
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
  
  let currencyFixCount = 0;
  let dateFixCount = 0;
  let gstFixCount = 0;
  
  // Process each file
  files.forEach(file => {
    if (fixCurrencyReferences(file)) currencyFixCount++;
    if (fixDateFormatting(file)) dateFixCount++;
    if (fixGSTCalculations(file)) gstFixCount++;
  });
  
  console.log(`Fixed currency references in ${currencyFixCount} files`);
  console.log(`Fixed date formatting in ${dateFixCount} files`);
  console.log(`Fixed GST calculations in ${gstFixCount} files`);
  console.log('Finished processing files');
};

main().catch(console.error);
