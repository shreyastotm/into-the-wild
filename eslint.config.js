import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "**/*.d.ts"] },

  // Base configuration for all TypeScript files
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // TypeScript strict rules
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/no-var-requires": "error",

      // React rules - Enhanced hook validation
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // General code quality
      "no-console": "warn",
      "no-debugger": "error",
      "no-duplicate-imports": "error",
      "prefer-const": "error",
      "no-var": "error",

      // Project-specific rules
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/\\b(?:USD|EUR|GBP)\\b/]",
          message:
            "Use Indian Rupee (₹) for currency. Use formatCurrency utility for proper formatting.",
        },
        {
          selector: "CallExpression[callee.name='className']",
          message:
            "Use Tailwind classes directly or cn() utility for conditional classes",
        },
      ],

      // Import organization
      "sort-imports": [
        "error",
        {
          ignoreCase: true,
          ignoreDeclarationSort: true,
          ignoreMemberSort: false,
          memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
          allowSeparatedGroups: false,
        },
      ],
    },
  },

  // Enhanced hook dependency rules for pages (where infinite loops are most dangerous)
  {
    files: ["src/pages/**/*.tsx"],
    rules: {
      "react-hooks/exhaustive-deps": "warn"
    }
  },

  // Stricter rules for components that handle data fetching
  {
    files: [
      "src/components/**/*.tsx",
      "src/pages/**/*.tsx",
      "src/hooks/**/*.ts"
    ],
    rules: {
      "react-hooks/exhaustive-deps": "warn"
    }
  },

  // Specific rules for test files
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  // Specific rules for configuration files
  {
    files: ["*.config.{js,ts}", "vite.config.{js,ts}"],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },
);
