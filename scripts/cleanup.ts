#!/usr/bin/env tsx

/**
 * Code Cleanup Agent
 * Removes irrelevant files, redundant code, and unused assets
 *
 * @author Into The Wild Development Team
 */

import { execSync } from "child_process";
import {
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  unlinkSync,
  existsSync,
} from "fs";
import { join, extname, basename, dirname } from "path";

interface CleanupReport {
  timestamp: string;
  filesAnalyzed: number;
  unusedFiles: string[];
  unusedImports: string[];
  redundantCode: string[];
  assetsOptimized: string[];
  totalSpaceSaved: string;
  recommendations: string[];
}

interface ImportUsage {
  file: string;
  imports: Array<{
    name: string;
    source: string;
    line: number;
    used: boolean;
  }>;
}

class CodeCleanupAgent {
  private report: CleanupReport;
  private sourceFiles: string[] = [];
  private unusedFiles: string[] = [];
  private importUsages: Map<string, ImportUsage> = new Map();

  async run(): Promise<void> {
    console.log("🧹 Code Cleanup Agent starting...");
    console.log("Project: Into The Wild");
    console.log("Target: Remove unused files, imports, and redundant code\n");

    this.report = {
      timestamp: new Date().toISOString(),
      filesAnalyzed: 0,
      unusedFiles: [],
      unusedImports: [],
      redundantCode: [],
      assetsOptimized: [],
      totalSpaceSaved: "0B",
      recommendations: [],
    };

    await this.initialize();
    await this.analyzeUnusedFiles();
    await this.analyzeUnusedImports();
    await this.analyzeRedundantCode();
    await this.analyzeAssets();
    await this.cleanupFiles();
    await this.generateReport();

    this.showSummary();
  }

  private async initialize(): Promise<void> {
    console.log("🔍 Initializing cleanup analysis...");

    // Find all source files
    this.sourceFiles = this.findSourceFiles();
    console.log(`📁 Found ${this.sourceFiles.length} source files to analyze`);

    // Create output directories
    execSync(
      'mkdir -p logs reports cleanup 2>/dev/null || echo "Directories exist"',
      { stdio: "inherit" },
    );
  }

  private findSourceFiles(): string[] {
    const srcFiles: string[] = [];
    const extensions = [".ts", ".tsx", ".js", ".jsx"];

    function traverse(dir: string): void {
      if (!existsSync(dir)) return;

      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (
          entry.isDirectory() &&
          !entry.name.startsWith(".") &&
          entry.name !== "node_modules"
        ) {
          traverse(fullPath);
        } else if (entry.isFile() && extensions.includes(extname(entry.name))) {
          srcFiles.push(fullPath);
        }
      }
    }

    traverse("src");
    return srcFiles;
  }

  private async analyzeUnusedFiles(): Promise<void> {
    console.log("🔍 Analyzing unused files...");

    const allFiles = this.getAllFiles();
    const referencedFiles = new Set<string>();

    // Find all import references
    for (const file of this.sourceFiles) {
      try {
        const content = readFileSync(file, "utf8");
        const imports = this.extractImports(content);

        for (const importPath of imports) {
          const resolvedPath = this.resolveImportPath(file, importPath);
          if (resolvedPath) {
            referencedFiles.add(resolvedPath);
          }
        }
      } catch (error) {
        console.log(`  ⚠️ Could not analyze ${file}`);
      }
    }

    // Identify unused files (excluding obvious entry points)
    const entryPoints = ["src/main.tsx", "src/App.tsx", "src/index.tsx"];
    const excludePatterns = [
      "node_modules",
      "dist",
      "logs",
      "reports",
      "coverage",
      ".git",
    ];

    for (const file of allFiles) {
      const relativePath = file
        .replace(/\\/g, "/")
        .replace(process.cwd().replace(/\\/g, "/") + "/", "");

      // Skip excluded patterns and entry points
      if (excludePatterns.some((pattern) => file.includes(pattern))) continue;
      if (entryPoints.includes(relativePath)) continue;
      if (file.includes("__tests__")) continue; // Don't remove test files

      // Check if file is referenced
      const isReferenced = Array.from(referencedFiles).some(
        (ref) => ref.includes(basename(file)) || file.includes(ref),
      );

      if (!isReferenced) {
        this.unusedFiles.push(relativePath);
        console.log(`  📄 Unused file: ${relativePath}`);
      }
    }

    this.report.filesAnalyzed = allFiles.length;
    console.log(
      `  ✅ Found ${this.unusedFiles.length} potentially unused files`,
    );
  }

  private getAllFiles(): string[] {
    const files: string[] = [];

    function traverse(dir: string): void {
      if (!existsSync(dir)) return;

      const entries = readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (
          entry.isDirectory() &&
          !entry.name.startsWith(".") &&
          entry.name !== "node_modules"
        ) {
          traverse(fullPath);
        } else if (entry.isFile()) {
          files.push(fullPath);
        }
      }
    }

    traverse(".");
    return files;
  }

  private extractImports(content: string): string[] {
    const imports: string[] = [];
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

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

  private resolveImportPath(
    fromFile: string,
    importPath: string,
  ): string | null {
    // Skip external packages
    if (
      importPath.startsWith("@/") ||
      importPath.startsWith("./") ||
      importPath.startsWith("../")
    ) {
      const fromDir = dirname(fromFile);
      const resolved = join(fromDir, importPath);

      // Handle index files
      if (
        resolved.endsWith(".js") ||
        resolved.endsWith(".ts") ||
        resolved.endsWith(".tsx")
      ) {
        return resolved;
      } else {
        return resolved + ".ts";
      }
    }

    return null;
  }

  private async analyzeUnusedImports(): Promise<void> {
    console.log("📦 Analyzing unused imports...");

    for (const file of this.sourceFiles) {
      try {
        const content = readFileSync(file, "utf8");
        const lines = content.split("\n");

        // Extract all imports
        const imports = this.extractImports(content);
        const importUsage: ImportUsage = {
          file,
          imports: [],
        };

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          // Regular imports
          const importMatch = line.match(
            /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/,
          );
          if (importMatch) {
            const importedItems = importMatch[1]
              .split(",")
              .map((item) => item.trim().split(" as ")[0]);
            const source = importMatch[2];

            for (const item of importedItems) {
              if (item) {
                const used = this.isImportUsed(content, item, i + 1);
                importUsage.imports.push({
                  name: item,
                  source,
                  line: i + 1,
                  used,
                });

                if (!used) {
                  this.report.unusedImports.push(
                    `${file}:${i + 1} - ${item} from ${source}`,
                  );
                  console.log(
                    `  📦 Unused import: ${file}:${i + 1} - ${item} from ${source}`,
                  );
                }
              }
            }
          }

          // Default imports
          const defaultMatch = line.match(
            /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/,
          );
          if (defaultMatch) {
            const importName = defaultMatch[1];
            const source = defaultMatch[2];
            const used = this.isImportUsed(content, importName, i + 1);

            importUsage.imports.push({
              name: importName,
              source,
              line: i + 1,
              used,
            });

            if (!used) {
              this.report.unusedImports.push(
                `${file}:${i + 1} - ${importName} from ${source}`,
              );
              console.log(
                `  📦 Unused import: ${file}:${i + 1} - ${importName} from ${source}`,
              );
            }
          }
        }

        this.importUsages.set(file, importUsage);
      } catch (error) {
        console.log(`  ⚠️ Could not analyze imports in ${file}`);
      }
    }

    console.log(
      `  ✅ Found ${this.report.unusedImports.length} unused imports`,
    );
  }

  private isImportUsed(
    content: string,
    importName: string,
    startLine: number,
  ): boolean {
    const lines = content.split("\n");
    const remainingContent = lines.slice(startLine).join("\n");

    // Check if import is used (excluding the import line itself)
    return new RegExp(`\\b${importName}\\b`).test(remainingContent);
  }

  private async analyzeRedundantCode(): Promise<void> {
    console.log("🔄 Analyzing redundant code patterns...");

    for (const file of this.sourceFiles) {
      try {
        const content = readFileSync(file, "utf8");
        const lines = content.split("\n");

        // Check for common redundant patterns
        const redundantPatterns = [
          // Unused variables
          {
            pattern: /const\s+\w+\s*=\s*[^;]+;\s*$/g,
            check: this.isVariableUnused.bind(this),
          },
          // Empty functions
          { pattern: /function\s+\w+\s*\(\s*\)\s*\{\s*\}/g, check: () => true },
          // Console.log statements in production code
          { pattern: /console\.(log|error|warn|info)/g, check: () => true },
          // TODO/FIXME comments
          { pattern: /TODO|FIXME|XXX|HACK/g, check: () => true },
        ];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];

          for (const { pattern, check } of redundantPatterns) {
            const matches = line.match(pattern);
            if (matches) {
              for (const match of matches) {
                if (check(match, lines, i)) {
                  this.report.redundantCode.push(
                    `${file}:${i + 1} - ${match.trim()}`,
                  );
                  console.log(
                    `  🔄 Redundant code: ${file}:${i + 1} - ${match.trim()}`,
                  );
                }
              }
            }
          }
        }
      } catch (error) {
        console.log(`  ⚠️ Could not analyze ${file}`);
      }
    }

    console.log(
      `  ✅ Found ${this.report.redundantCode.length} redundant code patterns`,
    );
  }

  private isVariableUnused(
    variable: string,
    lines: string[],
    lineIndex: number,
  ): boolean {
    // Check if variable is used after its declaration
    const remainingLines = lines.slice(lineIndex + 1).join("\n");
    return !new RegExp(`\\b${variable}\\b`).test(remainingLines);
  }

  private async analyzeAssets(): Promise<void> {
    console.log("🖼️ Analyzing asset files...");

    const assetExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".gif",
      ".svg",
      ".ico",
      ".webp",
    ];
    const assets = this.getAllFiles().filter((file) =>
      assetExtensions.includes(extname(file).toLowerCase()),
    );

    console.log(`  📁 Found ${assets.length} asset files`);

    // For now, just report on asset count and suggest optimization
    // In a full implementation, we would analyze file sizes, duplicates, etc.
    for (const asset of assets.slice(0, 10)) {
      // Show first 10
      const stats = statSync(asset);
      const size = this.formatBytes(stats.size);
      console.log(`  📄 ${basename(asset)} - ${size}`);
    }

    if (assets.length > 10) {
      console.log(`  ... and ${assets.length - 10} more assets`);
    }

    this.report.assetsOptimized = assets.map((file) => basename(file));
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  private async cleanupFiles(): Promise<void> {
    console.log("🗑️ Cleaning up unused files...");

    // For safety, we'll only remove files that are clearly unused
    // In a real implementation, this would require careful validation

    const safeToRemove = this.unusedFiles.filter(
      (file) =>
        (file.includes("__tests__") && !file.includes("vitest-globals")) ||
        file.includes(".old.") ||
        file.includes(".backup.") ||
        file.includes("temp") ||
        file.includes("tmp"),
    );

    console.log(
      `  ⚠️ Found ${safeToRemove.length} files that could be safely removed`,
    );
    console.log("  💡 Note: Manual review recommended before removing files");

    for (const file of safeToRemove.slice(0, 5)) {
      console.log(`  🗑️ Safe to remove: ${file}`);
    }

    if (safeToRemove.length > 5) {
      console.log(`  ... and ${safeToRemove.length - 5} more files`);
    }

    // Generate cleanup recommendations
    this.report.recommendations.push(
      `Consider removing ${safeToRemove.length} unused files`,
    );
    this.report.recommendations.push(
      `Review ${this.report.unusedImports.length} unused imports`,
    );
    this.report.recommendations.push(
      `Clean up ${this.report.redundantCode.length} redundant code patterns`,
    );
  }

  private async generateReport(): Promise<void> {
    console.log("📄 Generating cleanup report...");

    const report = {
      timestamp: this.report.timestamp,
      summary: {
        filesAnalyzed: this.report.filesAnalyzed,
        unusedFiles: this.unusedFiles.length,
        unusedImports: this.report.unusedImports.length,
        redundantCode: this.report.redundantCode.length,
        assetsFound: this.report.assetsOptimized.length,
      },
      details: {
        unusedFiles: this.unusedFiles.slice(0, 20), // Top 20
        unusedImports: this.report.unusedImports.slice(0, 20),
        redundantCode: this.report.redundantCode.slice(0, 20),
        recommendations: this.report.recommendations,
      },
    };

    try {
      writeFileSync(
        "reports/cleanup-analysis.json",
        JSON.stringify(report, null, 2),
      );
    } catch (error) {
      writeFileSync(
        "logs/cleanup-analysis.json",
        JSON.stringify(report, null, 2),
      );
    }

    // Generate human-readable report
    let reportText = `CODE CLEANUP REPORT
===================
Date: ${new Date().toISOString()}
Project: Into The Wild

EXECUTIVE SUMMARY:
📁 Files Analyzed: ${this.report.filesAnalyzed}
🗑️ Unused Files: ${this.unusedFiles.length}
📦 Unused Imports: ${this.report.unusedImports.length}
🔄 Redundant Code: ${this.report.redundantCode.length}
🖼️ Assets Found: ${this.report.assetsOptimized.length}

TOP ISSUES TO CLEAN:
`;

    if (this.unusedFiles.length > 0) {
      reportText += `\n🗑️ UNUSED FILES (${this.unusedFiles.length}):
`;
      for (const file of this.unusedFiles.slice(0, 10)) {
        reportText += `  - ${file}\n`;
      }
      if (this.unusedFiles.length > 10) {
        reportText += `  ... and ${this.unusedFiles.length - 10} more\n`;
      }
    }

    if (this.report.unusedImports.length > 0) {
      reportText += `\n📦 UNUSED IMPORTS (${this.report.unusedImports.length}):
`;
      for (const issue of this.report.unusedImports.slice(0, 10)) {
        reportText += `  - ${issue}\n`;
      }
      if (this.report.unusedImports.length > 10) {
        reportText += `  ... and ${this.report.unusedImports.length - 10} more\n`;
      }
    }

    if (this.report.redundantCode.length > 0) {
      reportText += `\n🔄 REDUNDANT CODE (${this.report.redundantCode.length}):
`;
      for (const issue of this.report.redundantCode.slice(0, 10)) {
        reportText += `  - ${issue}\n`;
      }
      if (this.report.redundantCode.length > 10) {
        reportText += `  ... and ${this.report.redundantCode.length - 10} more\n`;
      }
    }

    reportText += `\n🇮🇳 INDIAN MARKET COMPLIANCE:
  - Currency (₹): ${this.countIndianCurrency()} instances
  - Date Formatting: ${this.countIndianDates()} instances
  - GST Calculations: ${this.countGST()} instances

📊 ARCHITECTURE METRICS:
  - Responsive Patterns: ${this.countResponsivePatterns()} implementations
  - Dark Mode Support: ${this.countDarkModePatterns()} implementations
  - Accessibility: ${this.countAccessibilityPatterns()} attributes

RECOMMENDATIONS:
`;

    for (const rec of this.report.recommendations) {
      reportText += `✅ ${rec}\n`;
    }

    reportText += `\nNEXT STEPS:
1. Review unused files before removal
2. Remove unused imports automatically
3. Clean up redundant code patterns
4. Optimize asset files
5. Run 'npm run refactor' for improvements

Report saved to: reports/cleanup-analysis.json
`;

    try {
      writeFileSync("reports/cleanup-analysis.txt", reportText);
      console.log(`  📄 Report saved to reports/cleanup-analysis.txt`);
    } catch (error) {
      writeFileSync("logs/cleanup-analysis.txt", reportText);
      console.log(`  📄 Report saved to logs/cleanup-analysis.txt`);
    }
  }

  private countIndianCurrency(): number {
    return this.getAllFiles()
      .filter(
        (file) =>
          file.includes("src") &&
          (file.endsWith(".ts") || file.endsWith(".tsx")),
      )
      .reduce((count, file) => {
        try {
          const content = readFileSync(file, "utf8");
          return count + (content.match(/₹/g) || []).length;
        } catch {
          return count;
        }
      }, 0);
  }

  private countIndianDates(): number {
    return this.getAllFiles()
      .filter(
        (file) =>
          file.includes("src") &&
          (file.endsWith(".ts") || file.endsWith(".tsx")),
      )
      .reduce((count, file) => {
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
    return this.getAllFiles()
      .filter(
        (file) =>
          file.includes("src") &&
          (file.endsWith(".ts") || file.endsWith(".tsx")),
      )
      .reduce((count, file) => {
        try {
          const content = readFileSync(file, "utf8");
          return count + (content.match(/GST|calculateGST|18%/g) || []).length;
        } catch {
          return count;
        }
      }, 0);
  }

  private countResponsivePatterns(): number {
    return this.getAllFiles()
      .filter(
        (file) =>
          file.includes("src") &&
          (file.endsWith(".ts") || file.endsWith(".tsx")),
      )
      .reduce((count, file) => {
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
    return this.getAllFiles()
      .filter(
        (file) =>
          file.includes("src") &&
          (file.endsWith(".ts") || file.endsWith(".tsx")),
      )
      .reduce((count, file) => {
        try {
          const content = readFileSync(file, "utf8");
          return (
            count +
            (content.match(/dark:|theme|ThemeProvider|next-themes/g) || [])
              .length
          );
        } catch {
          return count;
        }
      }, 0);
  }

  private countAccessibilityPatterns(): number {
    return this.getAllFiles()
      .filter((file) => file.includes("src") && file.endsWith(".tsx"))
      .reduce((count, file) => {
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

  private showSummary(): void {
    console.log("\n🎯 CODE CLEANUP AGENT SUMMARY");
    console.log("=".repeat(50));
    console.log(`📁 Files Analyzed: ${this.report.filesAnalyzed}`);
    console.log(`🗑️ Unused Files: ${this.unusedFiles.length}`);
    console.log(`📦 Unused Imports: ${this.report.unusedImports.length}`);
    console.log(`🔄 Redundant Code: ${this.report.redundantCode.length}`);
    console.log(`🖼️ Assets Found: ${this.report.assetsOptimized.length}`);
    console.log(`📄 Report: reports/cleanup-analysis.txt`);

    console.log("\n🇮🇳 Indian Market Compliance:");
    console.log(`  ₹ Currency: ${this.countIndianCurrency()} instances`);
    console.log(`  📅 Date Format: ${this.countIndianDates()} instances`);
    console.log(`  💰 GST: ${this.countGST()} instances`);

    console.log("\n📱 Architecture Quality:");
    console.log(`  📱 Responsive: ${this.countResponsivePatterns()} patterns`);
    console.log(`  🌙 Dark Mode: ${this.countDarkModePatterns()} patterns`);
    console.log(
      `  ♿ Accessibility: ${this.countAccessibilityPatterns()} attributes`,
    );

    console.log("\n🚀 Next Steps:");
    console.log("  1. Review reports/cleanup-analysis.txt");
    console.log("  2. Remove confirmed unused files");
    console.log("  3. Clean up unused imports");
    console.log("  4. Address redundant code patterns");
    console.log("  5. Run npm run refactor for improvements");

    console.log("\n✅ Code Cleanup Agent completed!");
  }
}

// Run the agent
new CodeCleanupAgent().run().catch(console.error);
