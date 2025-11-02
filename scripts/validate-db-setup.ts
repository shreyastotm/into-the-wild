#!/usr/bin/env node

/**
 * Database Setup Validation Script
 *
 * Validates that the database schema management system is working correctly.
 *
 * Usage: npm run validate-db-setup
 */

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";
import path from "path";

interface ValidationResult {
  check: string;
  status: "✅" | "❌" | "⚠️";
  details: string;
}

class DatabaseSetupValidator {
  private results: ValidationResult[] = [];
  private readonly supabaseDir = path.join(process.cwd(), "supabase");
  private readonly scriptsDir = path.join(process.cwd(), "scripts");

  async validate(): Promise<void> {
    console.log("🔍 Validating database setup...\n");

    // Check 1: Required files exist
    this.checkFiles();

    // Check 2: Supabase configuration
    this.checkSupabaseConfig();

    // Check 3: Migration structure
    this.checkMigrations();

    // Check 4: Scripts are executable
    this.checkScripts();

    // Check 5: Package.json scripts
    this.checkPackageScripts();

    // Print results
    this.printResults();

    // Exit with appropriate code
    const hasErrors = this.results.some((r) => r.status === "❌");
    process.exit(hasErrors ? 1 : 0);
  }

  private checkFiles(): void {
    const files = [
      "supabase/migrations/20260101000000_comprehensive_schema_consolidation.sql",
      "scripts/db-schema-agent.ts",
      "database-schema/latest_schema.sql",
      "database-schema/README.md",
    ];

    files.forEach((file) => {
      const exists = existsSync(file);
      this.results.push({
        check: `File exists: ${file}`,
        status: exists ? "✅" : "❌",
        details: exists ? "File found" : "File missing",
      });
    });
  }

  private checkSupabaseConfig(): void {
    const configPath = path.join(this.supabaseDir, "config.toml");
    const exists = existsSync(configPath);

    this.results.push({
      check: "Supabase configuration",
      status: exists ? "✅" : "❌",
      details: exists ? "Config file found" : "Config file missing",
    });

    if (exists) {
      // Check if Supabase is running
      try {
        const status = execSync("npx supabase status", {
          cwd: this.supabaseDir,
          encoding: "utf8",
          stdio: "pipe",
        });
        const isRunning = status.includes("running");
        this.results.push({
          check: "Supabase local instance",
          status: isRunning ? "✅" : "⚠️",
          details: isRunning ? "Instance running" : "Instance not running",
        });
      } catch (error) {
        this.results.push({
          check: "Supabase local instance",
          status: "⚠️",
          details: "Cannot check status - may not be running",
        });
      }
    }
  }

  private checkMigrations(): void {
    const migrationsDir = path.join(this.supabaseDir, "migrations");
    const exists = existsSync(migrationsDir);

    this.results.push({
      check: "Migrations directory",
      status: exists ? "✅" : "❌",
      details: exists ? "Directory exists" : "Directory missing",
    });

    if (exists) {
      try {
        const files = execSync("dir", {
          cwd: migrationsDir,
          encoding: "utf8",
        });
        const hasConsolidated = files.includes(
          "20260101000000_comprehensive_schema_consolidation.sql",
        );
        this.results.push({
          check: "Consolidated migration",
          status: hasConsolidated ? "✅" : "❌",
          details: hasConsolidated
            ? "Migration file found"
            : "Migration file missing",
        });
      } catch (error) {
        this.results.push({
          check: "Migration files",
          status: "❌",
          details: "Cannot list migration files",
        });
      }
    }
  }

  private checkScripts(): void {
    const scriptPath = path.join(this.scriptsDir, "db-schema-agent.ts");
    const exists = existsSync(scriptPath);

    this.results.push({
      check: "Schema agent script",
      status: exists ? "✅" : "❌",
      details: exists ? "Script found" : "Script missing",
    });

    if (exists) {
      // Check if script is syntactically correct
      try {
        execSync(`npx tsc --noEmit --skipLibCheck ${scriptPath}`, {
          stdio: "pipe",
        });
        this.results.push({
          check: "Schema agent syntax",
          status: "✅",
          details: "Script compiles successfully",
        });
      } catch (error) {
        this.results.push({
          check: "Schema agent syntax",
          status: "❌",
          details: "Script has syntax errors",
        });
      }
    }
  }

  private checkPackageScripts(): void {
    try {
      const packageJsonPath = path.resolve(process.cwd(), "package.json");
      const packageJsonContent = readFileSync(packageJsonPath, "utf8");
      const packageJson = JSON.parse(packageJsonContent);
      const scripts = packageJson.scripts || {};

      const requiredScripts = [
        "db:sync",
        "db:validate",
        "db:consolidate",
        "db:backup",
        "db:health",
      ];

      requiredScripts.forEach((script) => {
        const exists = script in scripts;
        this.results.push({
          check: `Package script: ${script}`,
          status: exists ? "✅" : "❌",
          details: exists ? "Script defined" : "Script missing",
        });
      });
    } catch (error) {
      this.results.push({
        check: "Package.json scripts",
        status: "❌",
        details: `Cannot read package.json: ${error.message}`,
      });
    }
  }

  private printResults(): void {
    console.log("\n📋 Validation Results:\n");

    this.results.forEach((result) => {
      console.log(`${result.status} ${result.check}`);
      console.log(`   ${result.details}\n`);
    });

    const errors = this.results.filter((r) => r.status === "❌").length;
    const warnings = this.results.filter((r) => r.status === "⚠️").length;
    const success = this.results.filter((r) => r.status === "✅").length;

    console.log(
      `📊 Summary: ${success} passed, ${warnings} warnings, ${errors} errors\n`,
    );

    if (errors > 0) {
      console.log("❌ Validation failed! Please fix the errors above.\n");
    } else if (warnings > 0) {
      console.log("⚠️  Validation completed with warnings. Review above.\n");
    } else {
      console.log("✅ Validation successful! Database setup is complete.\n");
    }
  }
}

// Run validation
async function main() {
  const validator = new DatabaseSetupValidator();
  await validator.validate();
}

main().catch(console.error);
