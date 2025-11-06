#!/usr/bin/env node

/**
 * 📋 File Redundancy Agent - 13th Quality Agent
 *
 * This agent finds duplicate and redundant files.
 *
 * Usage:
 *   tsx scripts/file-redundancy-agent.ts analyze    - Analyze redundant files
 *   tsx scripts/file-redundancy-agent.ts report     - Generate report
 */

import fs from "fs";
import { promises as fsPromises } from "fs";
import * as path from "path";
import { glob } from "glob";
import crypto from "crypto";

interface RedundantFile {
  name: string;
  variants: string[];
  recommended: string;
  reason: string;
}

interface RedundancyReport {
  duplicateScripts: RedundantFile[];
  duplicateDocs: RedundantFile[];
  backupFiles: string[];
  recommendations: string[];
}

class FileRedundancyAgent {
  private readonly scriptsDir = path.join(process.cwd(), "scripts");
  private readonly docsDir = path.join(process.cwd(), "docs");
  private readonly reportsDir = path.join(process.cwd(), "reports");

  async analyze(): Promise<RedundancyReport> {
    console.log("📋 File Redundancy Agent - Starting Analysis...\n");

    const duplicateScripts = await this.findDuplicateScripts();
    const duplicateDocs = await this.findDuplicateDocs();
    const backupFiles = await this.findBackupFiles();

    const recommendations = this.generateRecommendations(
      duplicateScripts,
      duplicateDocs,
      backupFiles,
    );

    return {
      duplicateScripts,
      duplicateDocs,
      backupFiles,
      recommendations,
    };
  }

  private async findDuplicateScripts(): Promise<RedundantFile[]> {
    const duplicates: RedundantFile[] = [];

    // Check for extract_schema variants
    const extractSchemaFiles = await glob("extract_schema*", {
      cwd: this.scriptsDir,
    });

    if (extractSchemaFiles.length > 1) {
      duplicates.push({
        name: "extract_schema",
        variants: extractSchemaFiles,
        recommended: "extract_schema.ps1", // Keep PowerShell for Windows
        reason: "Multiple platform variants - consolidate to PowerShell",
      });
    }

    // Check for other potential duplicates
    const allScripts = await glob("*", { cwd: this.scriptsDir });
    const scriptGroups = new Map<string, string[]>();

    for (const script of allScripts) {
      const baseName = script
        .replace(/\.(ps1|sh|bat|js|ts|mjs)$/, "")
        .toLowerCase();
      if (!scriptGroups.has(baseName)) {
        scriptGroups.set(baseName, []);
      }
      scriptGroups.get(baseName)!.push(script);
    }

    for (const [baseName, variants] of scriptGroups.entries()) {
      if (variants.length > 1) {
        // Determine which to keep
        let recommended = variants[0];
        if (variants.some((v) => v.endsWith(".ps1"))) {
          recommended = variants.find((v) => v.endsWith(".ps1")) || variants[0];
        } else if (variants.some((v) => v.endsWith(".ts"))) {
          recommended = variants.find((v) => v.endsWith(".ts")) || variants[0];
        }

        duplicates.push({
          name: baseName,
          variants,
          recommended,
          reason: "Multiple variants - consolidate to one",
        });
      }
    }

    return duplicates;
  }

  private async findDuplicateDocs(): Promise<RedundantFile[]> {
    // Check for duplicate documentation patterns
    const docs = await glob("**/*.md", { cwd: this.docsDir });
    const duplicates: RedundantFile[] = [];

    // Group by similar names
    const docGroups = new Map<string, string[]>();

    for (const doc of docs) {
      const baseName = doc
        .replace(/\.(old|backup|temp|deprecated)/i, "")
        .toLowerCase();
      if (!docGroups.has(baseName)) {
        docGroups.set(baseName, []);
      }
      docGroups.get(baseName)!.push(doc);
    }

    for (const [baseName, variants] of docGroups.entries()) {
      if (variants.length > 1 && variants.some((v) => !v.includes("old"))) {
        const recommended = variants.find((v) => !v.includes("old")) || variants[0];
        duplicates.push({
          name: baseName,
          variants,
          recommended,
          reason: "Multiple versions - keep latest, archive old",
        });
      }
    }

    return duplicates;
  }

  private async findBackupFiles(): Promise<string[]> {
    const backups: string[] = [];

    // Find .old, .backup, .bak files
    const backupPatterns = await glob("**/*.{old,backup,bak}", {
      cwd: process.cwd(),
      ignore: ["**/node_modules/**", "**/dist/**"],
    });

    backups.push(...backupPatterns);

    return backups;
  }

  private generateRecommendations(
    duplicateScripts: RedundantFile[],
    duplicateDocs: RedundantFile[],
    backupFiles: string[],
  ): string[] {
    const recommendations: string[] = [];

    if (duplicateScripts.length > 0) {
      recommendations.push(
        `⚠️  Found ${duplicateScripts.length} duplicate script groups:`,
      );
      duplicateScripts.forEach((dup) => {
        recommendations.push(`\n   ${dup.name}:`);
        recommendations.push(`     Variants: ${dup.variants.join(", ")}`);
        recommendations.push(`     Recommended: Keep ${dup.recommended}`);
        recommendations.push(`     Reason: ${dup.reason}`);
      });
    }

    if (duplicateDocs.length > 0) {
      recommendations.push(
        `\n⚠️  Found ${duplicateDocs.length} duplicate documentation groups:`,
      );
      duplicateDocs.forEach((dup) => {
        recommendations.push(`\n   ${dup.name}:`);
        recommendations.push(`     Variants: ${dup.variants.join(", ")}`);
        recommendations.push(`     Recommended: Keep ${dup.recommended}`);
      });
    }

    if (backupFiles.length > 0) {
      recommendations.push(`\n📦 Found ${backupFiles.length} backup files`);
      recommendations.push("   These can be archived or removed");
    }

    if (
      duplicateScripts.length === 0 &&
      duplicateDocs.length === 0 &&
      backupFiles.length === 0
    ) {
      recommendations.push("✅ No redundant files found!");
    }

    return recommendations;
  }

  async generateReport(report: RedundancyReport): Promise<string> {
    const reportPath = path.join(
      this.reportsDir,
      `file-redundancy-${new Date().toISOString().split("T")[0]}.md`,
    );

    if (!fs.existsSync(this.reportsDir)) {
      await fsPromises.mkdir(this.reportsDir, { recursive: true });
    }

    const reportContent = `# File Redundancy Report

Generated: ${new Date().toISOString()}

## Summary

- **Duplicate Scripts**: ${report.duplicateScripts.length}
- **Duplicate Docs**: ${report.duplicateDocs.length}
- **Backup Files**: ${report.backupFiles.length}

## Duplicate Scripts

${report.duplicateScripts.length > 0 ? report.duplicateScripts.map(d => `### ${d.name}\n- Variants: ${d.variants.join(", ")}\n- Recommended: ${d.recommended}\n- Reason: ${d.reason}`).join("\n\n") : "✅ No duplicates found"}

## Duplicate Documentation

${report.duplicateDocs.length > 0 ? report.duplicateDocs.map(d => `### ${d.name}\n- Variants: ${d.variants.join(", ")}\n- Recommended: ${d.recommended}`).join("\n\n") : "✅ No duplicates found"}

## Backup Files

${report.backupFiles.length > 0 ? report.backupFiles.map(f => `- \`${f}\``).join("\n") : "✅ No backup files found"}

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
          console.log(`  - Duplicate Scripts: ${report.duplicateScripts.length}`);
          console.log(`  - Duplicate Docs: ${report.duplicateDocs.length}`);
          console.log(`  - Backup Files: ${report.backupFiles.length}`);
          console.log("\n💡 Run 'report' command to generate detailed report");
          break;

        case "report":
          const analysis = await this.analyze();
          const reportPath = await this.generateReport(analysis);
          console.log(`\n📄 Report generated: ${reportPath}`);
          break;

        default:
          console.log("📚 File Redundancy Agent Commands:");
          console.log("  analyze  - Analyze redundant files");
          console.log("  report   - Generate detailed report");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      process.exit(1);
    }
  }
}

// Run the agent
const agent = new FileRedundancyAgent();
agent.run().catch(console.error);

export { FileRedundancyAgent };

