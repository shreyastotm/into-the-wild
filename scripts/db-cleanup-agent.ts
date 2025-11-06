#!/usr/bin/env node

/**
 * 🗄️ Database Cleanup Agent - 9th Quality Agent
 *
 * This agent identifies and helps remove unused database tables, columns, and migrations.
 * It analyzes the codebase to find which tables are actually used vs. which are defined.
 *
 * Usage:
 *   tsx scripts/db-cleanup-agent.ts analyze    - Analyze unused tables/columns
 *   tsx scripts/db-cleanup-agent.ts report     - Generate cleanup report
 *   tsx scripts/db-cleanup-agent.ts suggest   - Suggest cleanup SQL
 */

import { execSync } from "child_process";
import fs from "fs";
import { promises as fsPromises } from "fs";
import * as path from "path";
import { glob } from "glob";

interface TableUsage {
  tableName: string;
  used: boolean;
  usageCount: number;
  files: string[];
  columns?: ColumnUsage[];
}

interface ColumnUsage {
  columnName: string;
  used: boolean;
  usageCount: number;
  files: string[];
}

interface CleanupReport {
  unusedTables: TableUsage[];
  unusedColumns: ColumnUsage[];
  orphanedMigrations: string[];
  recommendations: string[];
}

class DatabaseCleanupAgent {
  private readonly srcDir = path.join(process.cwd(), "src");
  private readonly migrationsDir = path.join(process.cwd(), "supabase/migrations");
  private readonly reportsDir = path.join(process.cwd(), "reports");

  // Tables that should be kept (explicitly requested or critical)
  private readonly keepTables = [
    "users",
    "trek_events",
    "trek_registrations",
    "trek_drivers", // Explicitly keep
    "trek_driver_assignments", // Explicitly keep
    "trek_expenses",
    "expense_shares",
    "notifications",
    "scheduled_notifications",
    "forum_categories",
    "forum_threads",
    "forum_posts",
    "nudges",
    "nudge_analytics",
    "profile_completion_stages",
    "profile_milestones",
    "user_interactions",
    "user_connections",
    "user_posts",
    "enhanced_notifications",
    "trek_event_images",
    "trek_event_videos",
    "user_trek_images",
    "image_tags",
    "registration_id_proofs",
    "id_types",
    "trek_pickup_locations",
    "tent_rentals",
    "trek_packing_list_assignments",
    "master_packing_items",
    "trek_costs",
    "trek_event_tag_assignments",
    "trek_event_tags",
    "trek_id_requirements",
    "trek_comments",
    "trek_ratings",
    "trek_participant_ratings",
    "site_settings",
  ];

  async analyze(): Promise<CleanupReport> {
    console.log("🗄️  Database Cleanup Agent - Starting Analysis...\n");

    // Find all tables defined in migrations
    const definedTables = await this.findDefinedTables();
    console.log(`📊 Found ${definedTables.length} tables in migrations`);

    // Find all table usage in codebase
    const tableUsage = await this.analyzeTableUsage(definedTables);
    console.log(`🔍 Analyzed table usage across codebase`);

    // Find unused tables
    const unusedTables = tableUsage.filter(
      (t) => !t.used && !this.keepTables.includes(t.tableName),
    );

    // Find orphaned migrations
    const orphanedMigrations = await this.findOrphanedMigrations();

    // Generate recommendations
    const recommendations = this.generateRecommendations(
      unusedTables,
      orphanedMigrations,
    );

    return {
      unusedTables,
      unusedColumns: [], // TODO: Implement column analysis
      orphanedMigrations,
      recommendations,
    };
  }

  private async findDefinedTables(): Promise<string[]> {
    const tables = new Set<string>();
    const migrationFiles = await glob("**/*.sql", {
      cwd: this.migrationsDir,
      ignore: ["**/_archived/**", "**/_archived_conflicts/**"],
    });

    for (const file of migrationFiles) {
      const content = await fsPromises.readFile(
        path.join(this.migrationsDir, file),
        "utf-8",
      );

      // Find CREATE TABLE statements
      const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:public\.)?(\w+)/gi;
      let match;
      while ((match = createTableRegex.exec(content)) !== null) {
        const tableName = match[1];
        // Filter out SQL keywords and common false positives
        const sqlKeywords = ['IF', 'if', 'above', 'below', 'then', 'else', 'when', 'case'];
        if (!sqlKeywords.includes(tableName)) {
          tables.add(tableName);
        }
      }
    }

    return Array.from(tables).sort();
  }

  private async analyzeTableUsage(
    definedTables: string[],
  ): Promise<TableUsage[]> {
    const usage: TableUsage[] = [];

    // Find all TypeScript/TSX files
    const sourceFiles = await glob("**/*.{ts,tsx}", {
      cwd: this.srcDir,
      ignore: ["**/node_modules/**", "**/__tests__/**", "**/_archive/**"],
    });

    for (const tableName of definedTables) {
      const files: string[] = [];
      let usageCount = 0;

      for (const file of sourceFiles) {
        const filePath = path.join(this.srcDir, file);
        const content = await fsPromises.readFile(filePath, "utf-8");

        // Look for .from("table_name") or .from('table_name')
        const regex = new RegExp(
          `\\.from\\(["']${tableName}["']\\)`,
          "gi",
        );
        const matches = content.match(regex);

        if (matches) {
          files.push(file);
          usageCount += matches.length;
        }
      }

      usage.push({
        tableName,
        used: usageCount > 0,
        usageCount,
        files,
      });
    }

    return usage;
  }

  private async findOrphanedMigrations(): Promise<string[]> {
    const orphaned: string[] = [];

    // Check _archived_conflicts folder
    const conflictsDir = path.join(
      this.migrationsDir,
      "_archived_conflicts",
    );
    if (fs.existsSync(conflictsDir)) {
      const conflictFiles = await fsPromises.readdir(conflictsDir);
      orphaned.push(
        ...conflictFiles
          .filter((f) => f.endsWith(".sql"))
          .map((f) => path.join("_archived_conflicts", f)),
      );
    }

    // Check REMOTE_APPLY files (temporary files)
    const remoteApplyFiles = await glob("REMOTE_APPLY_*.sql", {
      cwd: this.migrationsDir,
    });
    orphaned.push(...remoteApplyFiles);

    return orphaned;
  }

  private generateRecommendations(
    unusedTables: TableUsage[],
    orphanedMigrations: string[],
  ): string[] {
    const recommendations: string[] = [];

    if (unusedTables.length > 0) {
      recommendations.push(
        `⚠️  Found ${unusedTables.length} potentially unused tables. Review before deletion:`,
      );
      unusedTables.forEach((t) => {
        recommendations.push(`   - ${t.tableName} (0 usages found)`);
      });
      recommendations.push(
        "\n   💡 Before deleting, verify:",
        "   1. Check if tables are used in Supabase Edge Functions",
        "   2. Verify if tables are accessed via direct SQL",
        "   3. Check if tables are part of future features",
      );
    }

    if (orphanedMigrations.length > 0) {
      recommendations.push(
        `\n📦 Found ${orphanedMigrations.length} orphaned migration files:`,
      );
      orphanedMigrations.forEach((m) => {
        recommendations.push(`   - ${m}`);
      });
      recommendations.push(
        "\n   💡 These can be archived or removed after verification",
      );
    }

    if (unusedTables.length === 0 && orphanedMigrations.length === 0) {
      recommendations.push("✅ No cleanup needed! Database is clean.");
    }

    return recommendations;
  }

  async generateReport(report: CleanupReport): Promise<string> {
    const reportPath = path.join(
      this.reportsDir,
      `db-cleanup-report-${new Date().toISOString().split("T")[0]}.md`,
    );

    // Ensure reports directory exists
    if (!fs.existsSync(this.reportsDir)) {
      await fsPromises.mkdir(this.reportsDir, { recursive: true });
    }

    const reportContent = `# Database Cleanup Report

Generated: ${new Date().toISOString()}

## Summary

- **Unused Tables**: ${report.unusedTables.length}
- **Orphaned Migrations**: ${report.orphanedMigrations.length}

## Unused Tables

${report.unusedTables.length > 0 ? report.unusedTables.map(t => `### ${t.tableName}
- **Usage Count**: ${t.usageCount}
- **Status**: ${t.used ? "✅ Used" : "❌ Unused"}
- **Files**: ${t.files.length > 0 ? t.files.join(", ") : "None"}
`).join("\n") : "✅ No unused tables found"}

## Orphaned Migrations

${report.orphanedMigrations.length > 0 ? report.orphanedMigrations.map(m => `- \`${m}\``).join("\n") : "✅ No orphaned migrations found"}

## Recommendations

${report.recommendations.join("\n")}

## Next Steps

1. Review unused tables carefully before deletion
2. Archive orphaned migrations
3. Verify tables are not used in Edge Functions
4. Check for future feature dependencies
`;

    await fsPromises.writeFile(reportPath, reportContent, "utf-8");
    return reportPath;
  }

  async suggestCleanupSQL(report: CleanupReport): Promise<string> {
    const sqlPath = path.join(
      this.reportsDir,
      `db-cleanup-suggestions-${new Date().toISOString().split("T")[0]}.sql`,
    );

    if (!fs.existsSync(this.reportsDir)) {
      await fsPromises.mkdir(this.reportsDir, { recursive: true });
    }

    const sqlContent = `-- Database Cleanup Suggestions
-- Generated: ${new Date().toISOString()}
-- ⚠️  REVIEW CAREFULLY BEFORE EXECUTING
-- ⚠️  BACKUP DATABASE BEFORE RUNNING

BEGIN;

-- ====================================================================
-- POTENTIALLY UNUSED TABLES (REVIEW BEFORE DROPPING)
-- ====================================================================

${report.unusedTables.map(t => `-- Table: ${t.tableName}
-- Usage Count: ${t.usageCount}
-- Files: ${t.files.join(", ") || "None"}
-- DROP TABLE IF EXISTS public.${t.tableName} CASCADE;
`).join("\n")}

-- ====================================================================
-- ORPHANED MIGRATIONS (CAN BE ARCHIVED)
-- ====================================================================

${report.orphanedMigrations.map(m => `-- ${m} - Can be archived`).join("\n")}

-- ROLLBACK; -- Uncomment to rollback if needed
COMMIT;
`;

    await fsPromises.writeFile(sqlPath, sqlContent, "utf-8");
    return sqlPath;
  }

  async run(): Promise<void> {
    const command = process.argv[2] || "analyze";

    try {
      switch (command) {
        case "analyze":
          const report = await this.analyze();
          console.log("\n📊 Analysis Complete!\n");
          console.log("Summary:");
          console.log(`  - Unused Tables: ${report.unusedTables.length}`);
          console.log(`  - Orphaned Migrations: ${report.orphanedMigrations.length}`);
          console.log("\n💡 Run 'report' command to generate detailed report");
          break;

        case "report":
          const analysis = await this.analyze();
          const reportPath = await this.generateReport(analysis);
          console.log(`\n📄 Report generated: ${reportPath}`);
          break;

        case "suggest":
          const analysis2 = await this.analyze();
          const sqlPath = await this.suggestCleanupSQL(analysis2);
          console.log(`\n💾 SQL suggestions generated: ${sqlPath}`);
          break;

        default:
          console.log("📚 Database Cleanup Agent Commands:");
          console.log("  analyze  - Analyze unused tables/columns");
          console.log("  report   - Generate cleanup report");
          console.log("  suggest  - Suggest cleanup SQL");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      process.exit(1);
    }
  }
}

// Run the agent
const agent = new DatabaseCleanupAgent();
agent.run().catch(console.error);

export { DatabaseCleanupAgent };

