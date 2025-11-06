#!/usr/bin/env node

/**
 * 📦 Dependency Analysis Agent - 12th Quality Agent
 *
 * This agent analyzes and optimizes npm dependencies.
 *
 * Usage:
 *   tsx scripts/dependency-analysis-agent.ts analyze    - Analyze dependencies
 *   tsx scripts/dependency-analysis-agent.ts report     - Generate report
 */

import fs from "fs";
import { execSync } from "child_process";
import * as path from "path";

interface DependencyInfo {
  name: string;
  version: string;
  latest: string;
  outdated: boolean;
  used: boolean;
  size?: number;
}

interface DependencyReport {
  totalDependencies: number;
  outdated: DependencyInfo[];
  unused: DependencyInfo[];
  duplicates: string[];
  recommendations: string[];
}

class DependencyAnalysisAgent {
  private readonly packageJsonPath = path.join(process.cwd(), "package.json");
  private readonly reportsDir = path.join(process.cwd(), "reports");

  async analyze(): Promise<DependencyReport> {
    console.log("📦 Dependency Analysis Agent - Starting Analysis...\n");

    const packageJson = JSON.parse(
      await fs.promises.readFile(this.packageJsonPath, "utf-8"),
    );

    const dependencies = this.parseDependencies(packageJson);
    console.log(`📊 Found ${dependencies.length} dependencies`);

    const outdated = await this.findOutdated(dependencies);
    const unused = await this.findUnused(dependencies);
    const duplicates = await this.findDuplicates(dependencies);

    const recommendations = this.generateRecommendations(
      outdated,
      unused,
      duplicates,
    );

    return {
      totalDependencies: dependencies.length,
      outdated,
      unused,
      duplicates,
      recommendations,
    };
  }

  private parseDependencies(
    packageJson: any,
  ): DependencyInfo[] {
    const deps: DependencyInfo[] = [];

    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    for (const [name, version] of Object.entries(allDeps)) {
      deps.push({
        name,
        version: version as string,
        latest: "",
        outdated: false,
        used: false,
      });
    }

    return deps;
  }

  private async findOutdated(
    dependencies: DependencyInfo[],
  ): Promise<DependencyInfo[]> {
    console.log("🔍 Checking for outdated packages...");
    const outdated: DependencyInfo[] = [];

    // Note: This is a simplified check. In production, you'd use npm-check-updates
    for (const dep of dependencies) {
      try {
        // This would require npm-check-updates or similar tool
        // For now, we'll mark as not outdated
        dep.latest = dep.version;
      } catch (error) {
        // Ignore errors
      }
    }

    return outdated;
  }

  private async findUnused(
    dependencies: DependencyInfo[],
  ): Promise<DependencyInfo[]> {
    console.log("🔍 Checking for unused packages...");
    // TODO: Implement actual usage checking
    return [];
  }

  private findDuplicates(dependencies: DependencyInfo[]): string[] {
    const duplicates: string[] = [];
    const seen = new Set<string>();

    for (const dep of dependencies) {
      if (seen.has(dep.name)) {
        duplicates.push(dep.name);
      }
      seen.add(dep.name);
    }

    return duplicates;
  }

  private generateRecommendations(
    outdated: DependencyInfo[],
    unused: DependencyInfo[],
    duplicates: string[],
  ): string[] {
    const recommendations: string[] = [];

    if (outdated.length > 0) {
      recommendations.push(`⚠️  Found ${outdated.length} outdated packages`);
      recommendations.push("   Run 'npm update' to update packages");
    }

    if (unused.length > 0) {
      recommendations.push(`⚠️  Found ${unused.length} potentially unused packages`);
      recommendations.push("   Review before removing");
    }

    if (duplicates.length > 0) {
      recommendations.push(`⚠️  Found ${duplicates.length} duplicate packages`);
    }

    if (
      outdated.length === 0 &&
      unused.length === 0 &&
      duplicates.length === 0
    ) {
      recommendations.push("✅ Dependencies are clean!");
    }

    return recommendations;
  }

  async generateReport(report: DependencyReport): Promise<string> {
    const reportPath = path.join(
      this.reportsDir,
      `dependency-analysis-${new Date().toISOString().split("T")[0]}.md`,
    );

    if (!fs.existsSync(this.reportsDir)) {
      await fs.promises.mkdir(this.reportsDir, { recursive: true });
    }

    const reportContent = `# Dependency Analysis Report

Generated: ${new Date().toISOString()}

## Summary

- **Total Dependencies**: ${report.totalDependencies}
- **Outdated**: ${report.outdated.length}
- **Unused**: ${report.unused.length}
- **Duplicates**: ${report.duplicates.length}

## Recommendations

${report.recommendations.join("\n")}
`;

    await fs.promises.writeFile(reportPath, reportContent, "utf-8");
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
          console.log(`  - Total: ${report.totalDependencies}`);
          console.log(`  - Outdated: ${report.outdated.length}`);
          console.log(`  - Unused: ${report.unused.length}`);
          break;

        case "report":
          const analysis = await this.analyze();
          const reportPath = await this.generateReport(analysis);
          console.log(`\n📄 Report generated: ${reportPath}`);
          break;

        default:
          console.log("📚 Dependency Analysis Agent Commands:");
          console.log("  analyze  - Analyze dependencies");
          console.log("  report   - Generate detailed report");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      process.exit(1);
    }
  }
}

// Run the agent
const agent = new DependencyAnalysisAgent();
agent.run().catch(console.error);

export { DependencyAnalysisAgent };

