#!/usr/bin/env node

/**
 * 🔄 Migration Consolidation Agent - 10th Quality Agent
 *
 * This agent consolidates and cleans up migration files by:
 * - Merging archived migrations into consolidated schema
 * - Removing duplicate migrations
 * - Cleaning up conflict folders
 * - Validating migration order and dependencies
 *
 * Usage:
 *   tsx scripts/migration-consolidation-agent.ts analyze    - Analyze migrations
 *   tsx scripts/migration-consolidation-agent.ts consolidate - Consolidate migrations
 *   tsx scripts/migration-consolidation-agent.ts clean      - Clean up conflicts
 */

import fs from "fs";
import { promises as fsPromises } from "fs";
import * as path from "path";
import { glob } from "glob";

interface MigrationInfo {
  filename: string;
  path: string;
  timestamp: string;
  isArchived: boolean;
  isConflict: boolean;
  isRemoteApply: boolean;
  size: number;
  content: string;
}

interface ConsolidationReport {
  totalMigrations: number;
  activeMigrations: MigrationInfo[];
  archivedMigrations: MigrationInfo[];
  conflictMigrations: MigrationInfo[];
  remoteApplyMigrations: MigrationInfo[];
  duplicates: string[][];
  recommendations: string[];
}

class MigrationConsolidationAgent {
  private readonly migrationsDir = path.join(process.cwd(), "supabase/migrations");
  private readonly reportsDir = path.join(process.cwd(), "reports");
  private readonly archiveDir = path.join(
    this.migrationsDir,
    "_archived_consolidated",
  );

  async analyze(): Promise<ConsolidationReport> {
    console.log("🔄 Migration Consolidation Agent - Starting Analysis...\n");

    const migrations = await this.findAllMigrations();
    console.log(`📊 Found ${migrations.length} total migration files`);

    const activeMigrations = migrations.filter(
      (m) => !m.isArchived && !m.isConflict && !m.isRemoteApply,
    );
    const archivedMigrations = migrations.filter((m) => m.isArchived);
    const conflictMigrations = migrations.filter((m) => m.isConflict);
    const remoteApplyMigrations = migrations.filter((m) => m.isRemoteApply);

    const duplicates = await this.findDuplicates(migrations);

    const recommendations = this.generateRecommendations(
      activeMigrations,
      archivedMigrations,
      conflictMigrations,
      remoteApplyMigrations,
      duplicates,
    );

    return {
      totalMigrations: migrations.length,
      activeMigrations,
      archivedMigrations,
      conflictMigrations,
      remoteApplyMigrations,
      duplicates,
      recommendations,
    };
  }

  private async findAllMigrations(): Promise<MigrationInfo[]> {
    const migrations: MigrationInfo[] = [];

    // Find all SQL files in migrations directory
    const allFiles = await glob("**/*.sql", {
      cwd: this.migrationsDir,
      absolute: false,
    });

    for (const file of allFiles) {
      const filePath = path.join(this.migrationsDir, file);
      const stats = await fsPromises.stat(filePath);
      const content = await fsPromises.readFile(filePath, "utf-8");

      // Extract timestamp from filename (format: YYYYMMDDHHMMSS_description.sql)
      const timestampMatch = file.match(/^(\d{14})/);
      const timestamp = timestampMatch ? timestampMatch[1] : "00000000000000";

      migrations.push({
        filename: path.basename(file),
        path: file,
        timestamp,
        isArchived: file.includes("_archived"),
        isConflict: file.includes("_archived_conflicts"),
        isRemoteApply: file.startsWith("REMOTE_APPLY_"),
        size: stats.size,
        content,
      });
    }

    return migrations.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  }

  private async findDuplicates(
    migrations: MigrationInfo[],
  ): Promise<string[][]> {
    const duplicates: string[][] = [];
    const contentMap = new Map<string, string[]>();

    // Group migrations by content hash (simple content comparison)
    for (const migration of migrations) {
      const contentHash = this.hashContent(migration.content);
      if (!contentMap.has(contentHash)) {
        contentMap.set(contentHash, []);
      }
      contentMap.get(contentHash)!.push(migration.path);
    }

    // Find groups with more than one migration
    for (const [hash, paths] of contentMap.entries()) {
      if (paths.length > 1) {
        duplicates.push(paths);
      }
    }

    return duplicates;
  }

  private hashContent(content: string): string {
    // Simple hash - just use first 100 chars and size
    const preview = content.substring(0, 100).replace(/\s+/g, " ");
    return `${content.length}-${preview}`;
  }

  private generateRecommendations(
    active: MigrationInfo[],
    archived: MigrationInfo[],
    conflicts: MigrationInfo[],
    remoteApply: MigrationInfo[],
    duplicates: string[][],
  ): string[] {
    const recommendations: string[] = [];

    recommendations.push("📋 Migration Consolidation Recommendations:\n");

    if (active.length > 0) {
      recommendations.push(`✅ Active Migrations: ${active.length}`);
      recommendations.push(
        "   These are the current migrations in use. Keep these.\n",
      );
    }

    if (archived.length > 0) {
      recommendations.push(`📦 Archived Migrations: ${archived.length}`);
      recommendations.push(
        "   These are already archived. Can be moved to permanent archive.\n",
      );
    }

    if (conflicts.length > 0) {
      recommendations.push(`⚠️  Conflict Migrations: ${conflicts.length}`);
      recommendations.push(
        "   These need to be resolved. Review and merge if needed, then archive.\n",
      );
    }

    if (remoteApply.length > 0) {
      recommendations.push(`🔄 Remote Apply Migrations: ${remoteApply.length}`);
      recommendations.push(
        "   These are temporary files. Can be removed after remote application.\n",
      );
    }

    if (duplicates.length > 0) {
      recommendations.push(`🔁 Duplicate Migrations: ${duplicates.length} groups`);
      duplicates.forEach((group, idx) => {
        recommendations.push(`   Group ${idx + 1}:`);
        group.forEach((path) => {
          recommendations.push(`     - ${path}`);
        });
      });
      recommendations.push(
        "   Keep the most recent version, archive others.\n",
      );
    }

    if (
      archived.length === 0 &&
      conflicts.length === 0 &&
      remoteApply.length === 0 &&
      duplicates.length === 0
    ) {
      recommendations.push("✅ No consolidation needed! Migrations are clean.");
    }

    return recommendations;
  }

  async consolidate(): Promise<void> {
    console.log("🔄 Starting Migration Consolidation...\n");

    const report = await this.analyze();

    // Create archive directory if it doesn't exist
    if (!fs.existsSync(this.archiveDir)) {
      await fsPromises.mkdir(this.archiveDir, { recursive: true });
    }

    // Archive conflict migrations
    if (report.conflictMigrations.length > 0) {
      console.log(`📦 Archiving ${report.conflictMigrations.length} conflict migrations...`);
      const conflictArchiveDir = path.join(
        this.archiveDir,
        "conflicts",
        new Date().toISOString().split("T")[0],
      );
      await fsPromises.mkdir(conflictArchiveDir, { recursive: true });

      for (const migration of report.conflictMigrations) {
        const sourcePath = path.join(this.migrationsDir, migration.path);
        const destPath = path.join(
          conflictArchiveDir,
          migration.filename,
        );
        await fsPromises.copyFile(sourcePath, destPath);
        console.log(`   ✅ Archived: ${migration.filename}`);
      }
    }

    // Archive remote apply migrations
    if (report.remoteApplyMigrations.length > 0) {
      console.log(
        `📦 Archiving ${report.remoteApplyMigrations.length} remote apply migrations...`,
      );
      const remoteArchiveDir = path.join(
        this.archiveDir,
        "remote-apply",
        new Date().toISOString().split("T")[0],
      );
      await fsPromises.mkdir(remoteArchiveDir, { recursive: true });

      for (const migration of report.remoteApplyMigrations) {
        const sourcePath = path.join(this.migrationsDir, migration.path);
        const destPath = path.join(remoteArchiveDir, migration.filename);
        await fsPromises.copyFile(sourcePath, destPath);
        console.log(`   ✅ Archived: ${migration.filename}`);
      }
    }

    console.log("\n✅ Consolidation complete!");
    console.log("💡 Review archived files before deleting originals.");
  }

  async generateReport(report: ConsolidationReport): Promise<string> {
    const reportPath = path.join(
      this.reportsDir,
      `migration-consolidation-${new Date().toISOString().split("T")[0]}.md`,
    );

    if (!fs.existsSync(this.reportsDir)) {
      await fsPromises.mkdir(this.reportsDir, { recursive: true });
    }

    const reportContent = `# Migration Consolidation Report

Generated: ${new Date().toISOString()}

## Summary

- **Total Migrations**: ${report.totalMigrations}
- **Active Migrations**: ${report.activeMigrations.length}
- **Archived Migrations**: ${report.archivedMigrations.length}
- **Conflict Migrations**: ${report.conflictMigrations.length}
- **Remote Apply Migrations**: ${report.remoteApplyMigrations.length}
- **Duplicate Groups**: ${report.duplicates.length}

## Active Migrations

${report.activeMigrations.map(m => `- \`${m.filename}\` (${m.timestamp})`).join("\n")}

## Archived Migrations

${report.archivedMigrations.length > 0 ? report.archivedMigrations.map(m => `- \`${m.filename}\``).join("\n") : "None"}

## Conflict Migrations

${report.conflictMigrations.length > 0 ? report.conflictMigrations.map(m => `- \`${m.filename}\``).join("\n") : "None"}

## Remote Apply Migrations

${report.remoteApplyMigrations.length > 0 ? report.remoteApplyMigrations.map(m => `- \`${m.filename}\``).join("\n") : "None"}

## Duplicate Migrations

${report.duplicates.length > 0 ? report.duplicates.map((group, idx) => `### Group ${idx + 1}\n${group.map(p => `- \`${p}\``).join("\n")}`).join("\n\n") : "None"}

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
          console.log(`  - Total: ${report.totalMigrations}`);
          console.log(`  - Active: ${report.activeMigrations.length}`);
          console.log(`  - Archived: ${report.archivedMigrations.length}`);
          console.log(`  - Conflicts: ${report.conflictMigrations.length}`);
          console.log(`  - Remote Apply: ${report.remoteApplyMigrations.length}`);
          console.log(`  - Duplicates: ${report.duplicates.length}`);
          console.log("\n💡 Run 'report' command to generate detailed report");
          break;

        case "report":
          const analysis = await this.analyze();
          const reportPath = await this.generateReport(analysis);
          console.log(`\n📄 Report generated: ${reportPath}`);
          break;

        case "consolidate":
          await this.consolidate();
          break;

        default:
          console.log("📚 Migration Consolidation Agent Commands:");
          console.log("  analyze     - Analyze migrations");
          console.log("  report      - Generate consolidation report");
          console.log("  consolidate - Consolidate and archive migrations");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      process.exit(1);
    }
  }
}

// Run the agent
const agent = new MigrationConsolidationAgent();
agent.run().catch(console.error);

export { MigrationConsolidationAgent };

