#!/usr/bin/env tsx

/**
 * Auto-Fix Agent
 * Intelligent analysis and fix suggestions for code issues
 *
 * @author Into The Wild Development Team
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { join, extname, basename } from "path";
import { parse } from "@typescript-eslint/parser";

interface FixSuggestion {
  file: string;
  line: number;
  column: number;
  issue: string;
  fix: string;
  severity: "error" | "warning" | "info";
  category:
    | "syntax"
    | "style"
    | "performance"
    | "accessibility"
    | "security"
    | "indian-compliance";
  confidence: "high" | "medium" | "low";
  autoFix: boolean;
}

interface ESLintIssue {
  filePath: string;
  messages: Array<{
    ruleId: string;
    severity: number;
    message: string;
    line: number;
    column: number;
    nodeType?: string;
    suggestions?: Array<{
      message: string;
      fix: any;
    }>;
  }>;
}

class AutoFixAgent {
  private suggestions: FixSuggestion[] = [];
  private files: string[] = [];
  private appliedFixes: string[] = [];

  async run(): Promise<void> {
    console.log("🔧 Auto-Fix Agent starting...");
    console.log("Project: Into The Wild");
    console.log("Target: Indian Market Standards\n");

    await this.initialize();
    await this.analyzeESLintIssues();
    await this.analyzeTypeScriptIssues();
    await this.analyzeIndianCompliance();
    await this.analyzeAccessibilityIssues();
    await this.analyzePerformanceIssues();
    await this.analyzeSecurityIssues();

    this.applyAutomaticFixes();
    this.generateReport();
    this.showSummary();
  }

  private async initialize(): Promise<void> {
    console.log("🔍 Initializing analysis...");

    // Find all TypeScript/TSX files
    this.files = this.findSourceFiles();
    console.log(`📁 Found ${this.files.length} source files to analyze`);

    // Create output directories
    execSync(
      'mkdir -p logs reports fixes 2>/dev/null || echo "Directories already exist"',
      { stdio: "inherit" },
    );
  }

  private findSourceFiles(): string[] {
    const srcFiles: string[] = [];
    const extensions = [".ts", ".tsx"];

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

  private async analyzeESLintIssues(): Promise<void> {
    console.log("📋 Analyzing ESLint issues...");

    try {
      const eslintOutput = execSync(
        "npx eslint . --config eslint.refactor.config.js --format=json",
        {
          encoding: "utf8",
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
        },
      );

      const eslintResults: ESLintIssue[] = JSON.parse(eslintOutput);

      for (const result of eslintResults) {
        for (const message of result.messages) {
          const suggestion = this.createESLintSuggestion(
            result.filePath,
            message,
          );
          if (suggestion) {
            this.suggestions.push(suggestion);
          }
        }
      }

      console.log(`  ✅ Found ${this.suggestions.length} ESLint issues`);
    } catch (error: any) {
      console.log(`  ⚠️ ESLint analysis failed: ${error.message}`);
    }
  }

  private createESLintSuggestion(
    filePath: string,
    message: ESLintIssue["messages"][0],
  ): FixSuggestion | null {
    const severity =
      message.severity === 2
        ? "error"
        : message.severity === 1
          ? "warning"
          : "info";
    const confidence: "high" | "medium" | "low" = message.suggestions?.length
      ? "high"
      : "medium";

    let fix = "";
    let category: FixSuggestion["category"] = "style";
    let autoFix = false;

    // Analyze message and provide specific fixes
    if (message.ruleId?.includes("no-unused-vars")) {
      fix = "Remove unused variable or prefix with underscore (_)";
      autoFix = true;
    } else if (message.ruleId?.includes("no-explicit-any")) {
      fix = 'Replace "any" with proper TypeScript type';
      category = "syntax";
    } else if (message.ruleId?.includes("prefer-const")) {
      fix = 'Change "let" to "const"';
      autoFix = true;
    } else if (message.ruleId?.includes("no-console")) {
      fix = "Remove console.log or use logger service";
      category = "style";
    } else if (message.ruleId?.includes("import/order")) {
      fix = "Run import sorting";
      autoFix = true;
    } else if (message.ruleId?.includes("react-hooks/exhaustive-deps")) {
      fix = "Add missing dependencies to useEffect/useMemo/useCallback";
      category = "performance";
    } else if (message.ruleId?.includes("jsx-no-bind")) {
      fix = "Move function outside render or use useCallback";
      category = "performance";
      autoFix = true;
    } else if (message.message.includes("₹")) {
      fix = "Use formatCurrency utility for Indian Rupee formatting";
      category = "indian-compliance";
    } else if (
      message.message.includes("USD") ||
      message.message.includes("EUR")
    ) {
      fix = "Replace with Indian Rupee (₹) formatting";
      category = "indian-compliance";
      autoFix = true;
    }

    if (!fix) return null;

    return {
      file: filePath,
      line: message.line,
      column: message.column,
      issue: message.message,
      fix,
      severity,
      category,
      confidence,
      autoFix,
    };
  }

  private async analyzeTypeScriptIssues(): Promise<void> {
    console.log("🔷 Analyzing TypeScript issues...");

    try {
      const tsOutput = execSync("npx tsc --noEmit --strict", {
        encoding: "utf8",
      });

      // Parse TypeScript output for specific issues
      const lines = tsOutput.split("\n");

      for (const line of lines) {
        if (line.includes("error TS")) {
          const suggestion = this.parseTypeScriptError(line);
          if (suggestion) {
            this.suggestions.push(suggestion);
          }
        }
      }

      console.log(
        `  ✅ Found ${this.suggestions.filter((s) => s.category === "syntax").length} TypeScript issues`,
      );
    } catch (error: any) {
      // TypeScript errors are expected in strict mode
      console.log(
        `  ⚠️ TypeScript found ${this.suggestions.filter((s) => s.category === "syntax").length} issues`,
      );
    }
  }

  private parseTypeScriptError(line: string): FixSuggestion | null {
    const tsRegex = /(\S+):(\d+):(\d+) - error TS(\d+): (.+)/;
    const match = line.match(tsRegex);

    if (!match) return null;

    const [, file, lineNum, colNum, errorCode, message] = match;

    let fix = "";
    let autoFix = false;

    switch (errorCode) {
      case "2322":
        fix = "Type mismatch - check types and add proper typing";
        break;
      case "2345":
        fix = "Argument type error - check function signature";
        break;
      case "2339":
        fix = "Property does not exist - check object type definition";
        break;
      case "2304":
        fix = "Cannot find name - check imports or declare variable";
        break;
      case "7006":
        fix = 'Parameter implicitly has "any" type - add explicit typing';
        autoFix = true;
        break;
      default:
        fix = `TypeScript error TS${errorCode} - ${message}`;
    }

    return {
      file,
      line: parseInt(lineNum),
      column: parseInt(colNum),
      issue: message,
      fix,
      severity: "error",
      category: "syntax",
      confidence: "high",
      autoFix,
    };
  }

  private async analyzeIndianCompliance(): Promise<void> {
    console.log("🇮🇳 Analyzing Indian market compliance...");

    for (const file of this.files) {
      if (!file.includes(".tsx") && !file.includes(".ts")) continue;

      try {
        const content = readFileSync(file, "utf8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineNumber = i + 1;

          // Check for foreign currency
          if (line.match(/\$\d+|\bUSD\b|\bEUR\b|\bGBP\b/)) {
            this.suggestions.push({
              file,
              line: lineNumber,
              column: line.indexOf("$") + 1 || 0,
              issue: "Foreign currency detected",
              fix: "Replace with Indian Rupee (₹) and use formatCurrency utility",
              severity: "warning",
              category: "indian-compliance",
              confidence: "high",
              autoFix: true,
            });
          }

          // Check for non-Indian date formats
          if (
            line.match(/\b\d{4}-\d{2}-\d{2}\b/) &&
            !line.includes("formatIndianDate")
          ) {
            this.suggestions.push({
              file,
              line: lineNumber,
              column: 0,
              issue: "Non-Indian date format detected",
              fix: "Use DD/MM/YYYY format and formatIndianDate utility",
              severity: "warning",
              category: "indian-compliance",
              confidence: "medium",
              autoFix: false,
            });
          }

          // Check for hardcoded colors (should use design system)
          if (
            line.match(/#[0-9A-Fa-f]{6}/) &&
            !line.includes("color") &&
            !line.includes("bg-")
          ) {
            this.suggestions.push({
              file,
              line: lineNumber,
              column: line.indexOf("#") + 1,
              issue: "Hardcoded hex color detected",
              fix: "Use semantic color tokens from design system",
              severity: "warning",
              category: "style",
              confidence: "high",
              autoFix: true,
            });
          }
        }
      } catch (error) {
        console.log(`  ⚠️ Could not analyze ${file}`);
      }
    }

    console.log(
      `  ✅ Found ${this.suggestions.filter((s) => s.category === "indian-compliance").length} compliance issues`,
    );
  }

  private async analyzeAccessibilityIssues(): Promise<void> {
    console.log("♿ Analyzing accessibility issues...");

    for (const file of this.files) {
      if (!file.includes(".tsx")) continue;

      try {
        const content = readFileSync(file, "utf8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineNumber = i + 1;

          // Check for missing alt text
          if (line.includes("<img") && !line.includes("alt=")) {
            this.suggestions.push({
              file,
              line: lineNumber,
              column: line.indexOf("<img") + 1,
              issue: "Image missing alt attribute",
              fix: "Add descriptive alt text for accessibility",
              severity: "warning",
              category: "accessibility",
              confidence: "high",
              autoFix: false,
            });
          }

          // Check for missing ARIA labels
          if (
            line.includes("<button") &&
            !line.includes("aria-label") &&
            !line.includes("aria-labelledby")
          ) {
            this.suggestions.push({
              file,
              line: lineNumber,
              column: line.indexOf("<button") + 1,
              issue: "Button missing accessible name",
              fix: "Add aria-label or aria-labelledby for screen readers",
              severity: "warning",
              category: "accessibility",
              confidence: "medium",
              autoFix: false,
            });
          }

          // Check for interactive elements without focus management
          if (
            line.includes("onClick") &&
            !line.includes("tabIndex") &&
            !line.includes("button") &&
            !line.includes("a href")
          ) {
            this.suggestions.push({
              file,
              line: lineNumber,
              column: line.indexOf("onClick") + 1,
              issue: "Interactive element may need focus management",
              fix: "Consider adding tabIndex or using proper interactive elements",
              severity: "info",
              category: "accessibility",
              confidence: "low",
              autoFix: false,
            });
          }
        }
      } catch (error) {
        console.log(`  ⚠️ Could not analyze ${file}`);
      }
    }

    console.log(
      `  ✅ Found ${this.suggestions.filter((s) => s.category === "accessibility").length} accessibility issues`,
    );
  }

  private async analyzePerformanceIssues(): Promise<void> {
    console.log("⚡ Analyzing performance issues...");

    for (const file of this.files) {
      try {
        const content = readFileSync(file, "utf8");
        const lines = content.split("\n");

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const lineNumber = i + 1;

          // Check for inline functions in JSX (causes re-renders)
          if (
            line.match(/on\w+=\{\s*[\(\)\w\s]*=>\s*{/) &&
            !line.includes("useCallback")
          ) {
            this.suggestions.push({
              file,
              line: lineNumber,
              column: line.indexOf("on") + 1,
              issue: "Inline function in JSX may cause unnecessary re-renders",
              fix: "Move function outside render or wrap with useCallback",
              severity: "warning",
              category: "performance",
              confidence: "high",
              autoFix: false,
            });
          }

          // Check for missing React.memo on components
          if (
            line.match(/export\s+(const|function)\s+\w+.*=.*\(/) &&
            !line.includes("memo")
          ) {
            this.suggestions.push({
              file,
              line: lineNumber,
              column: line.indexOf("export") + 1,
              issue: "Component not memoized",
              fix: "Consider wrapping with React.memo for performance",
              severity: "info",
              category: "performance",
              confidence: "medium",
              autoFix: false,
            });
          }

          // Check for large inline objects/arrays
          if (line.includes("= {") || line.includes("= [")) {
            const nextLines = lines.slice(i, i + 10).join("\n");
            if (nextLines.split("\n").length > 5) {
              this.suggestions.push({
                file,
                line: lineNumber,
                column: line.indexOf("=") + 1,
                issue: "Large inline object/array may impact performance",
                fix: "Consider moving outside component or using useMemo",
                severity: "info",
                category: "performance",
                confidence: "low",
                autoFix: false,
              });
            }
          }
        }
      } catch (error) {
        console.log(`  ⚠️ Could not analyze ${file}`);
      }
    }

    console.log(
      `  ✅ Found ${this.suggestions.filter((s) => s.category === "performance").length} performance issues`,
    );
  }

  private async analyzeSecurityIssues(): Promise<void> {
    console.log("🔒 Analyzing security issues...");

    try {
      const auditOutput = execSync("npm audit --json", { encoding: "utf8" });
      const audit = JSON.parse(auditOutput);

      if (audit.vulnerabilities) {
        for (const [packageName, vuln] of Object.entries(
          audit.vulnerabilities as any,
        )) {
          this.suggestions.push({
            file: "package.json",
            line: 1,
            column: 1,
            issue: `Security vulnerability in ${packageName}`,
            fix: `Update or replace vulnerable package: ${packageName}`,
            severity: "error",
            category: "security",
            confidence: "high",
            autoFix: false,
          });
        }
      }

      console.log(
        `  ✅ Found ${this.suggestions.filter((s) => s.category === "security").length} security issues`,
      );
    } catch (error: any) {
      console.log(`  ⚠️ Security analysis failed: ${error.message}`);
    }
  }

  private applyAutomaticFixes(): void {
    console.log("🔧 Applying automatic fixes...");

    const autoFixes = this.suggestions.filter(
      (s) => s.autoFix && s.confidence === "high",
    );

    for (const fix of autoFixes.slice(0, 50)) {
      // Limit to prevent issues
      try {
        this.applyFix(fix);
        this.appliedFixes.push(`${fix.file}:${fix.line} - ${fix.fix}`);
      } catch (error) {
        console.log(`  ❌ Failed to apply fix: ${fix.file}:${fix.line}`);
      }
    }

    console.log(`  ✅ Applied ${this.appliedFixes.length} automatic fixes`);
  }

  private applyFix(fix: FixSuggestion): void {
    try {
      const content = readFileSync(fix.file, "utf8");
      const lines = content.split("\n");

      if (fix.line <= lines.length) {
        let modifiedLine = lines[fix.line - 1];

        // Apply specific fixes based on issue type
        if (fix.issue.includes("unused") && modifiedLine.includes("let ")) {
          modifiedLine = modifiedLine.replace("let ", "const ");
        } else if (
          fix.issue.includes("currency") &&
          modifiedLine.includes("$")
        ) {
          modifiedLine = modifiedLine.replace(/\$/g, "₹");
        } else if (fix.issue.includes("hex color")) {
          // Replace with semantic color (this is a basic implementation)
          modifiedLine = modifiedLine.replace(/#[0-9A-Fa-f]{6}/g, "bg-primary");
        }

        lines[fix.line - 1] = modifiedLine;
        writeFileSync(fix.file, lines.join("\n"));
      }
    } catch (error) {
      throw error;
    }
  }

  private generateReport(): void {
    console.log("📄 Generating fix report...");

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.suggestions.length,
        errors: this.suggestions.filter((s) => s.severity === "error").length,
        warnings: this.suggestions.filter((s) => s.severity === "warning")
          .length,
        info: this.suggestions.filter((s) => s.severity === "info").length,
        autoApplied: this.appliedFixes.length,
      },
      categories: {
        syntax: this.suggestions.filter((s) => s.category === "syntax").length,
        style: this.suggestions.filter((s) => s.category === "style").length,
        performance: this.suggestions.filter(
          (s) => s.category === "performance",
        ).length,
        accessibility: this.suggestions.filter(
          (s) => s.category === "accessibility",
        ).length,
        security: this.suggestions.filter((s) => s.category === "security")
          .length,
        "indian-compliance": this.suggestions.filter(
          (s) => s.category === "indian-compliance",
        ).length,
      },
      suggestions: this.suggestions.slice(0, 100), // Top 100 issues
      appliedFixes: this.appliedFixes,
    };

    writeFileSync(
      "reports/fix-suggestions.json",
      JSON.stringify(report, null, 2),
    );

    // Generate human-readable report
    let reportText = `AUTO-FIX AGENT REPORT
====================
Date: ${new Date().toISOString()}
Project: Into The Wild

EXECUTIVE SUMMARY:
✅ Total Issues Found: ${report.summary.total}
❌ Errors: ${report.summary.errors}
⚠️ Warnings: ${report.summary.warnings}
ℹ️ Info: ${report.summary.info}
🔧 Auto-Applied Fixes: ${report.summary.autoApplied}

CATEGORY BREAKDOWN:
🔷 Syntax Issues: ${report.categories.syntax}
💅 Style Issues: ${report.categories.style}
⚡ Performance Issues: ${report.categories.performance}
♿ Accessibility Issues: ${report.categories.accessibility}
🔒 Security Issues: ${report.categories.security}
🇮🇳 Indian Compliance Issues: ${report.categories["indian-compliance"]}

TOP ISSUES TO FIX:
`;

    const topIssues = this.suggestions.slice(0, 20);
    for (let i = 0; i < topIssues.length; i++) {
      const issue = topIssues[i];
      reportText += `${i + 1}. ${issue.file}:${issue.line} [${issue.category.toUpperCase()}] ${issue.severity.toUpperCase()}\n`;
      reportText += `   Issue: ${issue.issue}\n`;
      reportText += `   Fix: ${issue.fix}\n`;
      reportText += `   Confidence: ${issue.confidence} | Auto-fix: ${issue.autoFix ? "Yes" : "No"}\n\n`;
    }

    if (this.appliedFixes.length > 0) {
      reportText += `APPLIED FIXES:
`;
      for (const fix of this.appliedFixes.slice(0, 10)) {
        reportText += `✅ ${fix}\n`;
      }
      reportText += `\n`;
    }

    reportText += `NEXT STEPS:
1. Review the suggestions above and apply manual fixes
2. Run 'npm run refactor' for automatic improvements
3. Run 'npm run bug-detect' for comprehensive analysis
4. Run 'npm run quality-check' to verify all improvements

RECOMMENDATIONS:
`;

    // Add category-specific recommendations
    if (report.categories["indian-compliance"] > 0) {
      reportText += `🇮🇳 PRIORITY: Fix Indian market compliance issues (currency, dates, GST)\n`;
    }
    if (report.categories.security > 0) {
      reportText += `🔒 CRITICAL: Address security vulnerabilities immediately\n`;
    }
    if (report.categories.accessibility > 0) {
      reportText += `♿ IMPORTANT: Improve accessibility for WCAG 2.1 AA compliance\n`;
    }
    if (report.categories.performance > 0) {
      reportText += `⚡ RECOMMENDED: Implement performance optimizations\n`;
    }

    reportText += `\nReport saved to: reports/fix-suggestions.json\n`;
    reportText += `Log files in: logs/\n`;

    writeFileSync("reports/fix-suggestions.txt", reportText);

    console.log(`  📄 Report saved to reports/fix-suggestions.txt`);
  }

  private showSummary(): void {
    console.log("\n🎯 AUTO-FIX AGENT SUMMARY");
    console.log("=".repeat(50));
    console.log(`📊 Total Issues Found: ${this.suggestions.length}`);
    console.log(
      `❌ Errors: ${this.suggestions.filter((s) => s.severity === "error").length}`,
    );
    console.log(
      `⚠️ Warnings: ${this.suggestions.filter((s) => s.severity === "warning").length}`,
    );
    console.log(
      `ℹ️ Info: ${this.suggestions.filter((s) => s.severity === "info").length}`,
    );
    console.log(`🔧 Auto-Applied Fixes: ${this.appliedFixes.length}`);
    console.log(`📄 Report: reports/fix-suggestions.txt`);

    const categories = this.suggestions.reduce(
      (acc, s) => {
        acc[s.category] = (acc[s.category] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    console.log("\n📋 Issues by Category:");
    Object.entries(categories).forEach(([category, count]) => {
      console.log(`  ${category}: ${count}`);
    });

    console.log("\n🚀 Next Steps:");
    console.log("  1. Review reports/fix-suggestions.txt");
    console.log("  2. Apply manual fixes for remaining issues");
    console.log("  3. Run npm run refactor for more improvements");
    console.log("  4. Run npm run bug-detect for comprehensive analysis");
    console.log("  5. Commit when ready");

    console.log("\n✅ Auto-Fix Agent completed!");
  }
}

// Run the agent
new AutoFixAgent().run().catch(console.error);
