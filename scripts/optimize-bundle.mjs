#!/usr/bin/env node

/**
 * Bundle Optimization Script for Into The Wild
 * 
 * This script:
 * 1. Analyzes the bundle size
 * 2. Identifies opportunities for code splitting
 * 3. Optimizes imports
 * 4. Suggests lazy loading for large components
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

// Constants
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

// ANSI color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

/**
 * Print a colored message to the console
 */
function colorLog(message, color = 'reset') {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

/**
 * Print a section header
 */
function printHeader(title) {
  console.log('\n');
  colorLog('═'.repeat(80), 'cyan');
  colorLog(`  ${title}`, 'bright');
  colorLog('═'.repeat(80), 'cyan');
}

/**
 * Format file size in a human-readable format
 */
function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Check if a file is a React component
 */
async function isReactComponent(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return (
      (content.includes('import React') || content.includes('from "react"')) &&
      (content.includes('function') || content.includes('class')) &&
      (content.includes('return (') || content.includes('render('))
    );
  } catch (error) {
    return false;
  }
}

/**
 * Check if a component is already lazy loaded
 */
async function isLazyLoaded(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return content.includes('React.lazy') || content.includes('lazy(');
  } catch (error) {
    return false;
  }
}

/**
 * Find large components that could benefit from lazy loading
 */
async function findLargeComponents(dir, threshold = 10 * 1024) { // 10KB threshold
  const largeComponents = [];
  
  async function scanDirectory(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== 'dist') {
          await scanDirectory(fullPath);
        }
      } else if ((entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) && 
                !entry.name.includes('.test.') && 
                !entry.name.includes('.spec.')) {
        if (await isReactComponent(fullPath)) {
          const stats = await fs.stat(fullPath);
          if (stats.size > threshold && !(await isLazyLoaded(fullPath))) {
            largeComponents.push({
              path: fullPath,
              size: stats.size,
              name: path.basename(fullPath, path.extname(fullPath)),
            });
          }
        }
      }
    }
  }
  
  await scanDirectory(dir);
  return largeComponents.sort((a, b) => b.size - a.size);
}

/**
 * Analyze bundle size
 */
async function analyzeBundleSize() {
  printHeader('Analyzing Bundle Size');
  
  try {
    // Check if dist directory exists
    if (!await fileExists(DIST_DIR)) {
      colorLog('❌ dist directory not found. Run npm run build first.', 'red');
      return null;
    }
    
    // Check if assets directory exists
    if (!await fileExists(ASSETS_DIR)) {
      colorLog('❌ assets directory not found. Run npm run build first.', 'red');
      return null;
    }
    
    // Get all JS files in assets directory
    const jsFiles = await findFiles(ASSETS_DIR, '.js');
    
    // Get all CSS files in assets directory
    const cssFiles = await findFiles(ASSETS_DIR, '.css');
    
    // Calculate total size
    let totalJsSize = 0;
    let totalCssSize = 0;
    
    const jsFilesWithSize = await Promise.all(jsFiles.map(async (file) => {
      const stats = await fs.stat(file);
      totalJsSize += stats.size;
      return {
        path: file,
        size: stats.size,
        name: path.basename(file),
      };
    }));
    
    const cssFilesWithSize = await Promise.all(cssFiles.map(async (file) => {
      const stats = await fs.stat(file);
      totalCssSize += stats.size;
      return {
        path: file,
        size: stats.size,
        name: path.basename(file),
      };
    }));
    
    // Sort by size (largest first)
    jsFilesWithSize.sort((a, b) => b.size - a.size);
    cssFilesWithSize.sort((a, b) => b.size - a.size);
    
    return {
      jsFiles: jsFilesWithSize,
      cssFiles: cssFilesWithSize,
      totalJsSize,
      totalCssSize,
    };
  } catch (error) {
    colorLog(`❌ Error analyzing bundle size: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Check if a file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Find files with a specific extension
 */
async function findFiles(directory, extension) {
  const files = [];
  
  async function scanDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await scanDir(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(extension)) {
        files.push(fullPath);
      }
    }
  }
  
  await scanDir(directory);
  return files;
}

/**
 * Analyze imports in a file
 */
async function analyzeImports(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const importRegex = /import\s+(?:{[^}]*}|\*\s+as\s+\w+|\w+)\s+from\s+['"]([^'"]+)['"]/g;
    const imports = [];
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  } catch (error) {
    return [];
  }
}

/**
 * Find unused imports
 */
async function findUnusedImports() {
  printHeader('Finding Unused Imports');
  
  try {
    // Run ESLint with no-unused-vars rule
    colorLog('Running ESLint to find unused imports...', 'blue');
    
    try {
      execSync('npx eslint --rule "no-unused-vars: error" --format json src/**/*.{ts,tsx} > unused-imports.json', { stdio: 'ignore' });
      
      const unusedImportsJson = await fs.readFile('unused-imports.json', 'utf8');
      const unusedImports = JSON.parse(unusedImportsJson);
      
      // Clean up temporary file
      await fs.unlink('unused-imports.json');
      
      return unusedImports;
    } catch (error) {
      colorLog(`❌ Error running ESLint: ${error.message}`, 'red');
      return [];
    }
  } catch (error) {
    colorLog(`❌ Error finding unused imports: ${error.message}`, 'red');
    return [];
  }
}

/**
 * Suggest code splitting opportunities
 */
async function suggestCodeSplitting() {
  printHeader('Code Splitting Suggestions');
  
  // Find large components
  colorLog('Finding large components that could benefit from lazy loading...', 'blue');
  const largeComponents = await findLargeComponents(SRC_DIR);
  
  if (largeComponents.length === 0) {
    colorLog('✅ No large components found that need lazy loading.', 'green');
    return;
  }
  
  colorLog(`Found ${largeComponents.length} large components:`, 'yellow');
  
  for (const component of largeComponents) {
    colorLog(`  - ${component.name} (${formatSize(component.size)})`, 'yellow');
    colorLog(`    Path: ${path.relative(ROOT_DIR, component.path)}`, 'reset');
    
    // Suggest code to lazy load this component
    const relativePath = path.relative(SRC_DIR, component.path).replace(/\\/g, '/').replace(/\.[jt]sx?$/, '');
    
    colorLog('\n    Suggested code:', 'cyan');
    colorLog(`    import { lazy, Suspense } from 'react';`, 'reset');
    colorLog(`    const ${component.name} = lazy(() => import('@/${relativePath}'));`, 'reset');
    colorLog('', 'reset');
    colorLog('    // Usage:', 'reset');
    colorLog('    <Suspense fallback={<LoadingSpinner />}>', 'reset');
    colorLog(`      <${component.name} {...props} />`, 'reset');
    colorLog('    </Suspense>', 'reset');
    colorLog('', 'reset');
  }
}

/**
 * Suggest vite.config.ts optimizations
 */
function suggestViteConfig() {
  printHeader('Vite Config Optimization Suggestions');
  
  colorLog('Add the following to your vite.config.ts file:', 'blue');
  
  const suggestion = `
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          'vendor-supabase': ['@supabase/supabase-js'],
          
          // Split feature chunks
          'feature-admin': [/src\\/pages\\/admin/],
          'feature-trek': [/src\\/pages\\/trek/],
          'feature-auth': [/src\\/components\\/auth/],
          'feature-profile': [/src\\/components\\/profile/],
        },
        // Add content hash to file names for better caching
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash].[ext]',
      },
    },
    // Enable source maps for production (remove in final production build)
    sourcemap: true,
    // Minify output
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log statements
      },
    },
  },
});
  `;
  
  colorLog(suggestion, 'reset');
}

/**
 * Main function
 */
async function main() {
  try {
    colorLog('🚀 Bundle Optimization Script', 'bright');
    colorLog('This script analyzes and optimizes your bundle for faster deployment.\n', 'reset');
    
    // Build the project if dist directory doesn't exist
    if (!await fileExists(DIST_DIR)) {
      colorLog('📦 Building project...', 'blue');
      execSync('npm run build', { stdio: 'inherit' });
    }
    
    // Analyze bundle size
    const bundleAnalysis = await analyzeBundleSize();
    
    if (bundleAnalysis) {
      // Print JS files
      colorLog(`\nJavaScript files (${bundleAnalysis.jsFiles.length}):`, 'yellow');
      colorLog(`Total size: ${formatSize(bundleAnalysis.totalJsSize)}`, 'yellow');
      
      for (let i = 0; i < Math.min(bundleAnalysis.jsFiles.length, 10); i++) {
        const file = bundleAnalysis.jsFiles[i];
        colorLog(`  ${i + 1}. ${file.name} - ${formatSize(file.size)}`, 'reset');
      }
      
      // Print CSS files
      colorLog(`\nCSS files (${bundleAnalysis.cssFiles.length}):`, 'yellow');
      colorLog(`Total size: ${formatSize(bundleAnalysis.totalCssSize)}`, 'yellow');
      
      for (let i = 0; i < bundleAnalysis.cssFiles.length; i++) {
        const file = bundleAnalysis.cssFiles[i];
        colorLog(`  ${i + 1}. ${file.name} - ${formatSize(file.size)}`, 'reset');
      }
      
      // Print total size
      const totalSize = bundleAnalysis.totalJsSize + bundleAnalysis.totalCssSize;
      colorLog(`\nTotal bundle size: ${formatSize(totalSize)}`, 'bright');
      
      // Suggest code splitting
      await suggestCodeSplitting();
      
      // Suggest vite.config.ts optimizations
      suggestViteConfig();
      
      // Find unused imports
      const unusedImports = await findUnusedImports();
      
      if (unusedImports.length > 0) {
        printHeader('Unused Imports');
        colorLog(`Found ${unusedImports.length} files with unused imports.`, 'yellow');
        colorLog('Run the following command to fix unused imports:', 'blue');
        colorLog('  npm run lint:fix', 'reset');
      } else {
        colorLog('\n✅ No unused imports found.', 'green');
      }
    }
    
    // Final recommendations
    printHeader('Final Recommendations');
    colorLog('1. Implement code splitting for large components', 'green');
    colorLog('2. Update vite.config.ts with the suggested optimizations', 'green');
    colorLog('3. Remove unused imports', 'green');
    colorLog('4. Use dynamic imports for large libraries', 'green');
    colorLog('5. Optimize images using WebP format', 'green');
    colorLog('6. Enable compression on the server', 'green');
    
    colorLog('\n🎉 Bundle optimization analysis complete!', 'bright');
    
  } catch (error) {
    colorLog(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
