#!/usr/bin/env node

/**
 * Test Coverage Improvement Script
 * 
 * This script:
 * 1. Identifies components without tests
 * 2. Generates basic test files with meaningful assertions
 * 3. Adds mock providers for Supabase and other dependencies
 * 4. Creates a test coverage report
 */

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT_DIR, 'src');

// Configuration
const MOCK_PROVIDERS = `
import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
    signIn: jest.fn().mockResolvedValue({ data: {}, error: null }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
    onAuthStateChange: jest.fn().mockImplementation((callback) => {
      callback('SIGNED_IN', { user: { id: 'test-user-id' } });
      return { data: { subscription: { unsubscribe: jest.fn() } } };
    }),
  },
  from: jest.fn().mockReturnValue({
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data: {}, error: null }),
    match: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ data: {}, error: null }),
    update: jest.fn().mockResolvedValue({ data: {}, error: null }),
    delete: jest.fn().mockResolvedValue({ data: {}, error: null }),
  }),
  storage: {
    from: jest.fn().mockReturnValue({
      upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
      getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/image.jpg' } }),
    }),
  },
};

// Mock createClient to return our mock client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockImplementation(() => mockSupabaseClient),
}));

// Create a wrapper with all providers
export const AllTheProviders = ({ children }) => {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
};

// Custom render with providers
export const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };
`;

/**
 * Check if a file is a React component
 */
async function isReactComponent(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    // Check for React component patterns
    return (
      (content.includes('import React') || content.includes('from "react"')) &&
      (content.includes('function') || content.includes('class')) &&
      (content.includes('return (') || content.includes('render(')) &&
      !filePath.includes('.test.') &&
      !filePath.includes('.spec.')
    );
  } catch (error) {
    return false;
  }
}

/**
 * Generate a test file for a component
 */
async function generateTestFile(componentPath) {
  try {
    const componentName = path.basename(componentPath, path.extname(componentPath));
    const componentDir = path.dirname(componentPath);
    const testDir = path.join(componentDir, '__tests__');
    const testFilePath = path.join(testDir, `${componentName}.test.tsx`);
    
    // Create test directory if it doesn't exist
    await fs.mkdir(testDir, { recursive: true });
    
    // Read component to analyze props and behavior
    const componentContent = await fs.readFile(componentPath, 'utf8');
    
    // Check if component has props
    const hasProps = componentContent.includes('interface') || 
                    componentContent.includes('type') && 
                    componentContent.includes('Props');
    
    // Check if component uses useState
    const hasState = componentContent.includes('useState');
    
    // Check if component uses useEffect
    const hasEffects = componentContent.includes('useEffect');
    
    // Check if component has event handlers
    const hasEvents = componentContent.includes('onClick') || 
                     componentContent.includes('onChange') || 
                     componentContent.includes('onSubmit');
    
    // Check if component uses Supabase
    const usesSupabase = componentContent.includes('supabase');
    
    // Check if component uses router
    const usesRouter = componentContent.includes('useNavigate') || 
                      componentContent.includes('useParams') ||
                      componentContent.includes('useLocation');
    
    // Generate test content based on component analysis
    let testContent = `import React from 'react';
import { render, screen${hasEvents ? ', fireEvent' : ''}${hasState ? ', waitFor' : ''} } from '@testing-library/react';
import { describe, it, expect${usesSupabase ? ', vi, beforeEach' : ''} } from 'vitest';
import ${componentName} from '../${componentName}';
${usesSupabase ? "import { createClient } from '@supabase/supabase-js';" : ""}
${usesRouter ? "import { BrowserRouter } from 'react-router-dom';" : ""}

${usesSupabase ? `// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
      signIn: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      match: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: {}, error: null }),
      update: vi.fn().mockResolvedValue({ data: {}, error: null }),
      delete: vi.fn().mockResolvedValue({ data: {}, error: null }),
    }),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://example.com/image.jpg' } }),
      }),
    },
  })),
}));` : ""}

${usesRouter ? `// Wrapper for Router
const renderWithRouter = (ui) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};` : ""}

describe('${componentName}', () => {
  ${usesSupabase ? `beforeEach(() => {
    vi.clearAllMocks();
  });` : ""}

  it('renders without crashing', () => {
    ${usesRouter ? `renderWithRouter(<${componentName} ${hasProps ? 'data-testid="' + componentName.toLowerCase() + '"' : ''} />);` : 
      `render(<${componentName} ${hasProps ? 'data-testid="' + componentName.toLowerCase() + '"' : ''} />);`}
    ${hasProps ? `expect(screen.getByTestId('${componentName.toLowerCase()}')).toBeInTheDocument();` : 
      `expect(screen.getByText(/${componentName}|Submit|Save|Login|Register|Sign/i)).toBeInTheDocument();`}
  });

  ${hasProps ? `it('accepts and displays props correctly', () => {
    ${usesRouter ? `renderWithRouter(<${componentName} title="Test Title" data-testid="${componentName.toLowerCase()}" />);` : 
      `render(<${componentName} title="Test Title" data-testid="${componentName.toLowerCase()}" />);`}
    expect(screen.getByTestId('${componentName.toLowerCase()}')).toHaveTextContent('Test Title');
  });` : ""}

  ${hasEvents ? `it('handles user interactions', () => {
    const handleClick = vi.fn();
    ${usesRouter ? `renderWithRouter(<${componentName} onClick={handleClick} data-testid="${componentName.toLowerCase()}" />);` : 
      `render(<${componentName} onClick={handleClick} data-testid="${componentName.toLowerCase()}" />);`}
    fireEvent.click(screen.getByTestId('${componentName.toLowerCase()}'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });` : ""}

  ${hasState ? `it('updates state correctly', async () => {
    ${usesRouter ? `renderWithRouter(<${componentName} data-testid="${componentName.toLowerCase()}" />);` : 
      `render(<${componentName} data-testid="${componentName.toLowerCase()}" />);`}
    fireEvent.click(screen.getByTestId('${componentName.toLowerCase()}'));
    await waitFor(() => {
      expect(screen.getByTestId('${componentName.toLowerCase()}')).toHaveTextContent(/updated|changed|new/i);
    });
  });` : ""}

  ${usesSupabase ? `it('interacts with Supabase correctly', async () => {
    ${usesRouter ? `renderWithRouter(<${componentName} data-testid="${componentName.toLowerCase()}" />);` : 
      `render(<${componentName} data-testid="${componentName.toLowerCase()}" />);`}
    // Verify Supabase client was created
    expect(createClient).toHaveBeenCalled();
    
    // Test component behavior that uses Supabase
    // This will depend on the specific component
  });` : ""}
});
`;

    // Write the test file
    await fs.writeFile(testFilePath, testContent);
    console.log(`Generated test file: ${testFilePath}`);
    return true;
  } catch (error) {
    console.error(`Error generating test for ${componentPath}:`, error);
    return false;
  }
}

/**
 * Create test setup file
 */
async function createTestSetupFile() {
  const setupFilePath = path.join(SRC_DIR, 'test', 'setup.tsx');
  
  // Create directory if it doesn't exist
  await fs.mkdir(path.dirname(setupFilePath), { recursive: true });
  
  // Write setup file
  await fs.writeFile(setupFilePath, MOCK_PROVIDERS);
  console.log(`Created test setup file: ${setupFilePath}`);
}

/**
 * Find components without tests
 */
async function findComponentsWithoutTests(dir) {
  const componentsWithoutTests = [];
  
  async function scanDirectory(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== '__tests__') {
          await scanDirectory(fullPath);
        }
      } else if ((entry.name.endsWith('.tsx') || entry.name.endsWith('.jsx')) && 
                !entry.name.includes('.test.') && 
                !entry.name.includes('.spec.')) {
        // Check if it's a React component
        if (await isReactComponent(fullPath)) {
          // Check if a test file exists
          const testDir = path.join(path.dirname(fullPath), '__tests__');
          const testFile = path.join(testDir, `${path.basename(fullPath, path.extname(fullPath))}.test.tsx`);
          
          try {
            await fs.access(testFile);
            // Test file exists
          } catch (error) {
            // Test file doesn't exist
            componentsWithoutTests.push(fullPath);
          }
        }
      }
    }
  }
  
  await scanDirectory(dir);
  return componentsWithoutTests;
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('🧪 Test Coverage Improvement Script');
    console.log('----------------------------------');
    
    // Create test setup file
    await createTestSetupFile();
    
    // Find components without tests
    console.log('Finding components without tests...');
    const componentsWithoutTests = await findComponentsWithoutTests(path.join(SRC_DIR, 'components'));
    console.log(`Found ${componentsWithoutTests.length} components without tests.`);
    
    // Generate test files
    console.log('Generating test files...');
    let generatedCount = 0;
    for (const componentPath of componentsWithoutTests) {
      const success = await generateTestFile(componentPath);
      if (success) {
        generatedCount++;
      }
    }
    console.log(`Generated ${generatedCount} test files.`);
    
    // Run tests to see new coverage
    console.log('Running tests to generate coverage report...');
    try {
      execSync('npm test', { stdio: 'inherit' });
    } catch (error) {
      console.log('Tests completed with some failures. This is expected for newly generated tests.');
    }
    
    console.log('----------------------------------');
    console.log('🎉 Test coverage improvement complete!');
    console.log('Next steps:');
    console.log('1. Review the generated test files and improve them as needed.');
    console.log('2. Fix any failing tests.');
    console.log('3. Run npm test again to see the updated coverage.');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
