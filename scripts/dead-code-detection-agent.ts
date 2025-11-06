#!/usr/bin/env node

/**
 * 💀 Dead Code Detection Agent - 11th Quality Agent
 *
 * This agent finds unused files, functions, and components in the codebase.
 *
 * Usage:
 *   tsx scripts/dead-code-detection-agent.ts analyze    - Analyze dead code
 *   tsx scripts/dead-code-detection-agent.ts report     - Generate report
 */

import fs from "fs";
import { promises as fsPromises } from "fs";
import * as path from "path";
import { glob } from "glob";

interface DeadCodeReport {
  unusedFiles: string[];
  unusedExports: string[];
  orphanedComponents: string[];
  unusedUtilities: string[];
  recommendations: string[];
}

class DeadCodeDetectionAgent {
  private readonly srcDir = path.join(process.cwd(), "src");
  private readonly reportsDir = path.join(process.cwd(), "reports");

  // Files that should be ignored (entry points, configs, etc.)
  private readonly ignorePatterns = [
    "**/node_modules/**",
    "**/__tests__/**",
    "**/_archive/**",
    "**/*.test.ts",
    "**/*.test.tsx",
    "**/main.tsx",
    "**/App.tsx",
    "**/vite-env.d.ts",
    "**/setupTests.ts",
  ];

  async analyze(): Promise<DeadCodeDetectionAgent> {
    console.log("💀 Dead Code Detection Agent - Starting Analysis...\n");

    const allFiles = await this.findAllSourceFiles();
    console.log(`📊 Found ${allFiles.length} source files`);

    const unusedFiles = await this.findUnusedFiles(allFiles);
    const unusedExports = await this.findUnusedExports();
    const orphanedComponents = await this.findOrphanedComponents();

    const recommendations = this.generateRecommendations(
      unusedFiles,
      unusedExports,
      orphanedComponents,
    );

    return {
      unusedFiles,
      unusedExports,
      orphanedComponents,
      unusedUtilities: [],
      recommendations,
    };
  }

  private async findAllSourceFiles(): Promise<string[]> {
    return await glob("**/*.{ts,tsx}", {
      cwd: this.srcDir,
      ignore: this.ignorePatterns,
    });
  }

  private async findUnusedFiles(allFiles: string[]): Promise<string[]> {
    const unused: string[] = [];

    for (const file of allFiles) {
      const filePath = path.join(this.srcDir, file);
      const fileName = path.basename(file, path.extname(file));

      // Check if file is imported anywhere
      const isImported = await this.isFileImported(file, fileName, allFiles);

      if (!isImported && !this.isEntryPoint(file)) {
        unused.push(file);
      }
    }

    return unused;
  }

  private async isFileImported(
    filePath: string,
    fileName: string,
    allFiles: string[],
  ): Promise<boolean> {
    // Skip checking if it's a page component (likely used by router)
    if (filePath.includes("/pages/")) {
      return true;
    }

    // Check if file is imported in other files
    for (const otherFile of allFiles) {
      if (otherFile === filePath) continue;

      const content = await fsPromises.readFile(
        path.join(this.srcDir, otherFile),
        "utf-8",
      );

      // Check for import statements
      const importPatterns = [
        new RegExp(`from\\s+["'].*${fileName}["']`, "i"),
        new RegExp(`import.*${fileName}`, "i"),
        new RegExp(`require.*${fileName}`, "i"),
      ];

      if (importPatterns.some((pattern) => pattern.test(content))) {
        return true;
      }
    }

    return false;
  }

  private isEntryPoint(file: string): boolean {
    const entryPoints = [
      "main.tsx",
      "App.tsx",
      "index.tsx",
      "index.ts",
      "vite-env.d.ts",
    ];
    return entryPoints.some((ep) => file.endsWith(ep));
  }

  private async findUnusedExports(): Promise<string[]> {
    // TODO: Implement export analysis
    return [];
  }

  private async findOrphanedComponents(): Promise<string[]> {
    // TODO: Implement component analysis
    return [];
  }

  private generateRecommendations(
    unusedFiles: string[],
    unusedExports: string[],
    orphanedComponents: string[],
  ): string[] {
    const recommendations: string[] = [];

    if (unusedFiles.length > 0) {
      recommendations.push(
        `⚠️  Found ${unusedFiles.length} potentially unused files:`,
      );
      unusedFiles.slice(0, 10).forEach((file) => {
        recommendations.push(`   - ${file}`);
      });
      if (unusedFiles.length > 10) {
        recommendations.push(`   ... and ${unusedFiles.length - 10} more`);
      }
      recommendations.push(
        "\n   💡 Review these files before deletion:",
        "   1. Check if files are used dynamically",
        "   2. Verify if files are entry points",
        "   3. Check if files are used in tests",
      );
    }

    if (unusedFiles.length === 0) {
      recommendations.push("✅ No unused files found!");
    }

    return recommendations;
  }

  async generateReport(report: DeadCodeReport): Promise<string> {
    const reportPath = path.join(
      this.reportsDir,
      `dead-code-report-${new Date().toISOString().split("T")[0]}.md`,
    );

    if (!fs.existsSync(this.reportsDir)) {
      await fsPromises.mkdir(this.reportsDir, { recursive: true });
    }

    const reportContent = `# Dead Code Detection Report

Generated: ${new Date().toISOString()}

## Summary

- **Unused Files**: ${report.unusedFiles.length}
- **Unused Exports**: ${report.unusedExports.length}
- **Orphaned Components**: ${report.orphanedComponents.length}

## Unused Files

${report.unusedFiles.length > 0 ? report.unusedFiles.map(f => `- \`${f}\``).join("\n") : "✅ No unused files found"}

## Recommendations

${report.recommendations.join("\n")}
`;

    await fsPromises.writeFile(reportPath, reportContent, "utf-8");
    return reportPath;
  }

  async run(): Promise<void> {
    const command = process.argv[2] || "analyze";

    try {
      switch (command) {
        case "analyze":
          const report = await this.analyze();
          console.log("\n📊 Analysis Complete!\n");
          console.log("Summary:");
          console.log(`  - Unused Files: ${report.unusedFiles.length}`);
          console.log("\n💡 Run 'report' command to generate detailed report");
          break;

        case "report":
          const analysis = await this.analyze();
          const reportPath = await this.generateReport(analysis);
          console.log(`\n📄 Report generated: ${reportPath}`);
          break;

        default:
          console.log("📚 Dead Code Detection Agent Commands:");
          console.log("  analyze  - Analyze dead code");
          console.log("  report   - Generate detailed report");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      process.exit(1);
    }
  }
}

// Run the agent
const agent = new DeadCodeDetectionAgent();
agent.run().catch(console.error);

export { DeadCodeDetectionAgent };

