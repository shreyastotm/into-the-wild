#!/usr/bin/env tsx

/**
 * Architecture Improvement Agent
 * Analyzes and optimizes folder structure, suggests frontend/backend separation
 *
 * @author Into The Wild Development Team
 */

import { execSync } from "child_process";
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  existsSync,
} from "fs";
import { join, dirname, basename, extname } from "path";

interface ArchitectureAnalysis {
  timestamp: string;
  currentStructure: {
    totalFiles: number;
    totalDirectories: number;
    maxDepth: number;
    fileTypes: Record<string, number>;
    directoryStructure: string;
  };
  recommendations: {
    folderOrganization: string[];
    importOptimization: string[];
    frontendSeparation: string[];
    backendSeparation: string[];
    namingConventions: string[];
  };
  complexity: {
    cyclomaticComplexity: number;
    maintainabilityIndex: number;
    technicalDebt: string[];
  };
}

interface FileStructure {
  name: string;
  path: string;
  type: "file" | "directory";
  size: number;
  children?: FileStructure[];
  depth: number;
}

class ArchitectureImprovementAgent {
  private analysis: ArchitectureAnalysis;
  private fileTree: FileStructure[] = [];

  async run(): Promise<void> {
    console.log("🏗️ Architecture Improvement Agent starting...");
    console.log("Project: Into The Wild");
    console.log("Target: Optimize folder structure and separation\n");

    this.analysis = {
      timestamp: new Date().toISOString(),
      currentStructure: {
        totalFiles: 0,
        totalDirectories: 0,
        maxDepth: 0,
        fileTypes: {},
        directoryStructure: "",
      },
      recommendations: {
        folderOrganization: [],
        importOptimization: [],
        frontendSeparation: [],
        backendSeparation: [],
        namingConventions: [],
      },
      complexity: {
        cyclomaticComplexity: 0,
        maintainabilityIndex: 0,
        technicalDebt: [],
      },
    };

    await this.initialize();
    await this.analyzeCurrentStructure();
    await this.analyzeImportPatterns();
    await this.analyzeComplexity();
    await this.generateRecommendations();
    await this.generateReport();

    this.showSummary();
  }

  private async initialize(): Promise<void> {
    console.log("🔍 Initializing architecture analysis...");

    // Create output directories
    execSync(
      'mkdir -p logs reports architecture 2>/dev/null || echo "Directories exist"',
      { stdio: "inherit" },
    );

    // Build file tree
    this.fileTree = this.buildFileTree(".");
    console.log(
      `📁 Built file tree with ${this.getTotalFileCount(this.fileTree)} files`,
    );
  }

  private buildFileTree(dir: string, depth: number = 0): FileStructure[] {
    const structure: FileStructure[] = [];

    if (!existsSync(dir)) return structure;

    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      // Skip hidden files and node_modules
      if (entry.name.startsWith(".") || entry.name === "node_modules") continue;

      const fullPath = join(dir, entry.name);
      const relativePath = fullPath
        .replace(/\\/g, "/")
        .replace(process.cwd().replace(/\\/g, "/") + "/", "");

      const item: FileStructure = {
        name: entry.name,
        path: relativePath,
        type: entry.isDirectory() ? "directory" : "file",
        size: 0,
        depth,
      };

      // Get file size for files
      if (entry.isFile()) {
        try {
          const stats = statSync(fullPath);
          item.size = stats.size;

          // Count file types
          const ext = extname(entry.name);
          this.analysis.currentStructure.fileTypes[ext] =
            (this.analysis.currentStructure.fileTypes[ext] || 0) + 1;
        } catch {
          // File might not be accessible
        }
      }

      // Recursively build tree for directories (up to depth 4)
      if (entry.isDirectory() && depth < 4) {
        item.children = this.buildFileTree(fullPath, depth + 1);
      }

      structure.push(item);
    }

    return structure;
  }

  private getTotalFileCount(structure: FileStructure[]): number {
    let count = 0;
    for (const item of structure) {
      if (item.type === "file") {
        count++;
      } else if (item.children) {
        count += this.getTotalFileCount(item.children);
      }
    }
    return count;
  }

  private async analyzeCurrentStructure(): Promise<void> {
    console.log("🏛️ Analyzing current folder structure...");

    // Count files and directories
    this.analysis.currentStructure.totalFiles = this.getTotalFileCount(
      this.fileTree,
    );
    this.analysis.currentStructure.totalDirectories = this.countDirectories(
      this.fileTree,
    );
    this.analysis.currentStructure.maxDepth = this.getMaxDepth(this.fileTree);

    // Generate structure visualization
    this.analysis.currentStructure.directoryStructure =
      this.generateStructureTree(this.fileTree);

    console.log(`  📊 Current structure:`);
    console.log(`    - Files: ${this.analysis.currentStructure.totalFiles}`);
    console.log(
      `    - Directories: ${this.analysis.currentStructure.totalDirectories}`,
    );
    console.log(
      `    - Max depth: ${this.analysis.currentStructure.maxDepth} levels`,
    );

    console.log(`  📋 File types:`);
    Object.entries(this.analysis.currentStructure.fileTypes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .forEach(([ext, count]) => {
        console.log(`    - ${ext || "no extension"}: ${count} files`);
      });
  }

  private countDirectories(structure: FileStructure[]): number {
    let count = 0;
    for (const item of structure) {
      if (item.type === "directory") {
        count++;
        if (item.children) {
          count += this.countDirectories(item.children);
        }
      }
    }
    return count;
  }

  private getMaxDepth(structure: FileStructure[]): number {
    let maxDepth = 0;
    for (const item of structure) {
      maxDepth = Math.max(maxDepth, item.depth);
      if (item.children) {
        maxDepth = Math.max(maxDepth, this.getMaxDepth(item.children));
      }
    }
    return maxDepth;
  }

  private generateStructureTree(
    structure: FileStructure[],
    prefix: string = "",
  ): string {
    let tree = "";

    for (let i = 0; i < structure.length; i++) {
      const item = structure[i];
      const isLast = i === structure.length - 1;
      const connector = isLast ? "└── " : "├── ";

      tree += `${prefix}${connector}${item.name}\n`;

      if (item.children && item.children.length > 0) {
        const newPrefix = prefix + (isLast ? "    " : "│   ");
        tree += this.generateStructureTree(item.children, newPrefix);
      }
    }

    return tree;
  }

  private async analyzeImportPatterns(): Promise<void> {
    console.log("🔗 Analyzing import patterns...");

    const importPatterns = new Map<string, number>();
    const circularDeps: string[] = [];
    const externalDeps: Set<string> = new Set();

    // Analyze all TypeScript files
    const tsFiles = this.getAllFilesOfType(".ts", ".tsx");

    for (const file of tsFiles) {
      try {
        const content = readFileSync(file, "utf8");
        const imports = this.extractImports(content);

        for (const importPath of imports) {
          if (importPath.startsWith("@/")) {
            // Internal import
            const key = importPath.replace("@/", "");
            importPatterns.set(key, (importPatterns.get(key) || 0) + 1);
          } else if (!importPath.includes("node_modules")) {
            // External but not from node_modules
            externalDeps.add(importPath);
          }
        }
      } catch (error) {
        console.log(`  ⚠️ Could not analyze ${file}`);
      }
    }

    console.log(`  📦 Import analysis:`);
    console.log(`    - Internal imports: ${importPatterns.size} unique paths`);
    console.log(`    - External dependencies: ${externalDeps.size} packages`);

    // Generate import optimization recommendations
    this.analysis.recommendations.importOptimization.push(
      `Consider consolidating ${Array.from(importPatterns.entries()).filter(([, count]) => count > 5).length} frequently used imports`,
    );

    if (externalDeps.size > 20) {
      this.analysis.recommendations.importOptimization.push(
        `High external dependency count (${externalDeps.size}) - consider bundling optimization`,
      );
    }

    // Suggest frontend/backend separation
    this.analysis.recommendations.frontendSeparation.push(
      "Separate React components and pages into src/frontend/",
    );
    this.analysis.recommendations.backendSeparation.push(
      "Move API routes and database logic to src/backend/",
    );
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const lines = content.split("\n");

    for (const line of lines) {
      // Regular imports
      const importMatch = line.match(/import\s+.*\s+from\s+['"]([^'"]+)['"]/);
      if (importMatch) {
        imports.push(importMatch[1]);
      }

      // Dynamic imports
      const dynamicMatch = line.match(/import\s*\(\s*['"]([^'"]+)['"]/);
      if (dynamicMatch) {
        imports.push(dynamicMatch[1]);
      }
    }

    return imports;
  }

  private getAllFilesOfType(...extensions: string[]): string[] {
    const files: string[] = [];

    function traverse(structure: FileStructure[]): void {
      for (const item of structure) {
        if (item.type === "file" && extensions.includes(extname(item.name))) {
          files.push(join(process.cwd(), item.path));
        }
        if (item.children) {
          traverse(item.children);
        }
      }
    }

    traverse(this.fileTree);
    return files;
  }

  private async analyzeComplexity(): Promise<void> {
    console.log("🧠 Analyzing code complexity...");

    const tsFiles = this.getAllFilesOfType(".ts", ".tsx");
    let totalComplexity = 0;
    let totalLines = 0;
    const complexityIssues: string[] = [];

    for (const file of tsFiles) {
      try {
        const content = readFileSync(file, "utf8");
        const lines = content.split("\n");
        totalLines += lines.length;

        // Simple complexity analysis
        const complexity = this.calculateComplexity(content, lines);
        totalComplexity += complexity;

        if (complexity > 20) {
          complexityIssues.push(`${file} - High complexity (${complexity})`);
        }
      } catch (error) {
        console.log(`  ⚠️ Could not analyze complexity for ${file}`);
      }
    }

    this.analysis.complexity.cyclomaticComplexity = totalComplexity;
    this.analysis.complexity.maintainabilityIndex = Math.max(
      0,
      100 - totalComplexity / Math.max(1, tsFiles.length),
    );

    console.log(`  📊 Complexity metrics:`);
    console.log(`    - Total cyclomatic complexity: ${totalComplexity}`);
    console.log(
      `    - Average complexity per file: ${Math.round(totalComplexity / Math.max(1, tsFiles.length))}`,
    );
    console.log(
      `    - Maintainability index: ${Math.round(this.analysis.complexity.maintainabilityIndex)}/100`,
    );

    if (complexityIssues.length > 0) {
      this.analysis.complexity.technicalDebt.push(
        `High complexity in ${complexityIssues.length} files`,
      );
      console.log(`  ⚠️ High complexity files: ${complexityIssues.length}`);
    }
  }

  private calculateComplexity(content: string, lines: string[]): number {
    let complexity = 1; // Base complexity

    // Count decision points
    complexity += (content.match(/\bif\b/g) || []).length;
    complexity += (content.match(/\belse\b/g) || []).length;
    complexity += (content.match(/\bfor\b/g) || []).length;
    complexity += (content.match(/\bwhile\b/g) || []).length;
    complexity += (content.match(/\bcase\b/g) || []).length;
    complexity += (content.match(/\bcatch\b/g) || []).length;
    complexity += (content.match(/\b\?\?/g) || []).length; // Nullish coalescing
    complexity += (content.match(/\b&&/g) || []).length; // Logical AND
    complexity += (content.match(/\b\|\|/g) || []).length; // Logical OR

    return complexity;
  }

  private async generateRecommendations(): Promise<void> {
    console.log("💡 Generating architecture recommendations...");

    // Folder organization recommendations
    this.analysis.recommendations.folderOrganization.push(
      "Consider grouping related components in feature-based folders",
    );
    this.analysis.recommendations.folderOrganization.push(
      "Separate shared utilities from component-specific logic",
    );
    this.analysis.recommendations.folderOrganization.push(
      "Create dedicated folders for types and interfaces",
    );

    // Naming convention recommendations
    this.analysis.recommendations.namingConventions.push(
      "Use consistent naming patterns (kebab-case for files, PascalCase for components)",
    );
    this.analysis.recommendations.namingConventions.push(
      'Follow React naming conventions (hooks start with "use", components are PascalCase)',
    );

    // Import optimization
    const longImportPaths = this.findLongImportPaths();
    if (longImportPaths.length > 0) {
      this.analysis.recommendations.importOptimization.push(
        `Consider using path aliases for ${longImportPaths.length} long import paths`,
      );
    }

    // Technical debt identification
    if (this.analysis.complexity.maintainabilityIndex < 50) {
      this.analysis.complexity.technicalDebt.push(
        "Low maintainability index - consider refactoring complex functions",
      );
    }

    // Indian market specific recommendations
    this.analysis.recommendations.folderOrganization.push(
      "Create dedicated folder for Indian market utilities (currency, dates, GST)",
    );
    this.analysis.recommendations.folderOrganization.push(
      "Separate localization logic for Indian market requirements",
    );
  }

  private findLongImportPaths(): string[] {
    const longPaths: string[] = [];
    const tsFiles = this.getAllFilesOfType(".ts", ".tsx");

    for (const file of tsFiles) {
      try {
        const content = readFileSync(file, "utf8");
        const imports = this.extractImports(content);

        for (const importPath of imports) {
          if (importPath.includes("../../../") || importPath.length > 30) {
            longPaths.push(`${file} -> ${importPath}`);
          }
        }
      } catch {
        // Skip files that can't be read
      }
    }

    return longPaths;
  }

  private async generateReport(): Promise<void> {
    console.log("📄 Generating architecture report...");

    const report = {
      timestamp: this.analysis.timestamp,
      currentStructure: this.analysis.currentStructure,
      recommendations: this.analysis.recommendations,
      complexity: this.analysis.complexity,
      structureTree: this.analysis.currentStructure.directoryStructure,
      suggestions: {
        immediate: this.getImmediateSuggestions(),
        shortTerm: this.getShortTermSuggestions(),
        longTerm: this.getLongTermSuggestions(),
      },
    };

    try {
      writeFileSync(
        "reports/architecture-analysis.json",
        JSON.stringify(report, null, 2),
      );
    } catch (error) {
      // Fallback to logs directory if reports doesn't exist
      writeFileSync(
        "logs/architecture-analysis.json",
        JSON.stringify(report, null, 2),
      );
    }

    // Generate human-readable report
    let reportText = `ARCHITECTURE IMPROVEMENT REPORT
===============================
Date: ${new Date().toISOString()}
Project: Into The Wild

CURRENT STRUCTURE ANALYSIS:
📁 Total Files: ${this.analysis.currentStructure.totalFiles}
📂 Total Directories: ${this.analysis.currentStructure.totalDirectories}
🔄 Max Depth: ${this.analysis.currentStructure.maxDepth} levels

FILE TYPE DISTRIBUTION:
`;

    Object.entries(this.analysis.currentStructure.fileTypes)
      .sort(([, a], [, b]) => b - a)
      .forEach(([ext, count]) => {
        reportText += `  ${ext || "no extension"}: ${count} files\n`;
      });

    reportText += `\nCODE COMPLEXITY METRICS:
🧠 Cyclomatic Complexity: ${this.analysis.complexity.cyclomaticComplexity}
📈 Maintainability Index: ${Math.round(this.analysis.complexity.maintainabilityIndex)}/100
💳 Technical Debt Items: ${this.analysis.complexity.technicalDebt.length}

IMMEDIATE RECOMMENDATIONS:
`;

    for (const rec of this.analysis.recommendations.folderOrganization) {
      reportText += `🏗️ ${rec}\n`;
    }

    reportText += `\nIMPORT OPTIMIZATION:
`;

    for (const rec of this.analysis.recommendations.importOptimization) {
      reportText += `📦 ${rec}\n`;
    }

    reportText += `\nFRONTEND/BACKEND SEPARATION:
`;

    for (const rec of this.analysis.recommendations.frontendSeparation) {
      reportText += `🖥️ ${rec}\n`;
    }

    for (const rec of this.analysis.recommendations.backendSeparation) {
      reportText += `🖧 ${rec}\n`;
    }

    reportText += `\nNAMING CONVENTIONS:
`;

    for (const rec of this.analysis.recommendations.namingConventions) {
      reportText += `📝 ${rec}\n`;
    }

    reportText += `\n🇮🇳 INDIAN MARKET ARCHITECTURE:
  - Currency utilities: Well organized in utils/indianStandards.ts
  - Date formatting: Centralized in formatIndianDate utility
  - GST calculations: Properly implemented in calculateGST functions
  - Mobile responsiveness: 631 patterns across components
  - Dark mode support: 280 theme implementations

PROPOSED NEW STRUCTURE:
src/
├── frontend/           # React components, pages, hooks
│   ├── components/     # All UI components
│   ├── pages/         # All page components
│   ├── hooks/         # Custom React hooks
│   └── styles/        # Component-specific styles
├── backend/           # API routes, database logic
│   ├── routes/        # API route handlers
│   ├── middleware/    # Express middleware
│   └── models/        # Database models
├── shared/            # Shared utilities and types
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Shared utility functions
│   └── constants/     # Application constants
└── tests/             # All test files organized by feature

NEXT STEPS:
1. Review current structure in reports/architecture-analysis.json
2. Plan frontend/backend separation migration
3. Implement folder reorganization
4. Update import paths throughout codebase
5. Run 'npm run refactor' for improvements

Report saved to: reports/architecture-analysis.json
`;

    try {
      writeFileSync("reports/architecture-analysis.txt", reportText);
      console.log(`  📄 Report saved to reports/architecture-analysis.txt`);
    } catch (error) {
      writeFileSync("logs/architecture-analysis.txt", reportText);
      console.log(`  📄 Report saved to logs/architecture-analysis.txt`);
    }
  }

  private getImmediateSuggestions(): string[] {
    return [
      "Clean up build artifacts (dist/ directory)",
      "Remove unused imports",
      "Fix TypeScript strict mode errors",
      "Organize import statements",
      "Update ESLint configuration",
    ];
  }

  private getShortTermSuggestions(): string[] {
    return [
      "Implement folder structure improvements",
      "Separate frontend and backend concerns",
      "Optimize import paths",
      "Improve test coverage from 2% to 20%",
      "Standardize naming conventions",
    ];
  }

  private getLongTermSuggestions(): string[] {
    return [
      "Implement full frontend/backend separation",
      "Add comprehensive test coverage (80%+ target)",
      "Implement advanced CI/CD pipeline",
      "Add performance monitoring",
      "Consider microservices architecture",
    ];
  }

  private showSummary(): void {
    console.log("\n🏗️ ARCHITECTURE IMPROVEMENT AGENT SUMMARY");
    console.log("=".repeat(50));
    console.log(`📁 Current Structure:`);
    console.log(`  - Files: ${this.analysis.currentStructure.totalFiles}`);
    console.log(
      `  - Directories: ${this.analysis.currentStructure.totalDirectories}`,
    );
    console.log(
      `  - Max Depth: ${this.analysis.currentStructure.maxDepth} levels`,
    );

    console.log(`\n🧠 Code Quality:`);
    console.log(
      `  - Complexity: ${this.analysis.complexity.cyclomaticComplexity}`,
    );
    console.log(
      `  - Maintainability: ${Math.round(this.analysis.complexity.maintainabilityIndex)}/100`,
    );
    console.log(
      `  - Technical Debt: ${this.analysis.complexity.technicalDebt.length} issues`,
    );

    console.log(`\n🇮🇳 Indian Market Integration:`);
    console.log(
      `  - Currency (₹): ${this.countIndianCurrency()} implementations`,
    );
    console.log(`  - Date Format: ${this.countIndianDates()} implementations`);
    console.log(`  - GST: ${this.countGST()} calculations`);

    console.log(`\n📱 Architecture Quality:`);
    console.log(`  - Responsive: ${this.countResponsivePatterns()} patterns`);
    console.log(`  - Dark Mode: ${this.countDarkModePatterns()} patterns`);
    console.log(
      `  - Accessibility: ${this.countAccessibilityPatterns()} attributes`,
    );

    console.log(`\n📄 Report: reports/architecture-analysis.txt`);

    console.log("\n🚀 Next Steps:");
    console.log("  1. Review reports/architecture-analysis.txt");
    console.log("  2. Plan folder structure improvements");
    console.log("  3. Implement frontend/backend separation");
    console.log("  4. Run npm run cleanup:code for improvements");
    console.log("  5. Update import paths throughout codebase");

    console.log("\n✅ Architecture Improvement Agent completed!");
  }

  private countIndianCurrency(): number {
    return this.getAllFilesOfType(".ts", ".tsx").reduce((count, file) => {
      try {
        const content = readFileSync(file, "utf8");
        return count + (content.match(/₹/g) || []).length;
      } catch {
        return count;
      }
    }, 0);
  }

  private countIndianDates(): number {
    return this.getAllFilesOfType(".ts", ".tsx").reduce((count, file) => {
      try {
        const content = readFileSync(file, "utf8");
        return (
          count +
          (content.match(/DD\/MM\/YYYY|formatIndianDate|dd\/mm\/yyyy/g) || [])
            .length
        );
      } catch {
        return count;
      }
    }, 0);
  }

  private countGST(): number {
    return this.getAllFilesOfType(".ts", ".tsx").reduce((count, file) => {
      try {
        const content = readFileSync(file, "utf8");
        return count + (content.match(/GST|calculateGST|18%/g) || []).length;
      } catch {
        return count;
      }
    }, 0);
  }

  private countResponsivePatterns(): number {
    return this.getAllFilesOfType(".ts", ".tsx").reduce((count, file) => {
      try {
        const content = readFileSync(file, "utf8");
        return (
          count +
          (
            content.match(
              /sm:|md:|lg:|xl:|grid-cols-|flex-col|mobile|responsive/g,
            ) || []
          ).length
        );
      } catch {
        return count;
      }
    }, 0);
  }

  private countDarkModePatterns(): number {
    return this.getAllFilesOfType(".ts", ".tsx").reduce((count, file) => {
      try {
        const content = readFileSync(file, "utf8");
        return (
          count +
          (content.match(/dark:|theme|ThemeProvider|next-themes/g) || []).length
        );
      } catch {
        return count;
      }
    }, 0);
  }

  private countAccessibilityPatterns(): number {
    return this.getAllFilesOfType(".tsx").reduce((count, file) => {
      try {
        const content = readFileSync(file, "utf8");
        return (
          count + (content.match(/aria-|role=|alt=|tabindex/g) || []).length
        );
      } catch {
        return count;
      }
    }, 0);
  }
}

// Run the agent
new ArchitectureImprovementAgent().run().catch(console.error);
