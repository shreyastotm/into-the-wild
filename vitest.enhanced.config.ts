/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/setupTests.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov", "json-summary"],
      exclude: [
        "node_modules/",
        "src/setupTests.ts",
        "src/types/",
        "**/*.d.ts",
        "prereq/**",
        "dist/**",
        "docs/**",
        "scripts/**",
        "coverage/**",
        "**/*.config.*",
        "src/main.tsx",
        "src/vite-env.d.ts",
      ],
      include: ["src/**/*.{ts,tsx}", "backend/**/*.ts"],
      thresholds: {
        global: {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85,
        },
        // More lenient thresholds for utility files
        "./src/utils/": {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
        // Strict thresholds for components
        "./src/components/": {
          branches: 90,
          functions: 90,
          lines: 90,
          statements: 90,
        },
        // Critical business logic
        "./src/lib/": {
          branches: 95,
          functions: 95,
          lines: 95,
          statements: 95,
        },
      },
      reportOnFailure: true,
      reporter: [
        ["text", { skipEmpty: false }],
        ["html", { subdir: "html" }],
        ["json-summary"],
        ["lcov"],
      ],
    },
    testTimeout: 15000,
    hookTimeout: 15000,
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: false,
        useAtomics: true,
      },
    },
    // Enhanced test matching
    include: [
      "**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "**/__tests__/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      "prereq/**",
    ],
    // Performance optimizations
    maxWorkers: "50%",
    minWorkers: 1,
    // Enhanced reporting
    reporter: process.env.CI ? ["verbose", "github-actions"] : ["verbose"],
    // Better error reporting
    onConsoleLog(log) {
      if (log.includes("Warning")) return false;
      return true;
    },
    // Test environment setup
    environmentOptions: {
      jsdom: {
        resources: "usable",
        runScripts: "dangerously",
        pretendToBeVisual: true,
        html: "<!DOCTYPE html><html><body></body></html>",
      },
    },
    // Global test setup
    globalSetup: [],
    setupFiles: ["./src/setupTests.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Enhanced build optimization for testing
  build: {
    sourcemap: true,
    minify: false,
    target: "esnext",
  },
  // Performance monitoring
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@supabase/supabase-js",
      "date-fns",
      "lucide-react",
    ],
  },
});
