import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import react from "eslint-plugin-react";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";

export default tseslint.config(
  { ignores: ["dist", "node_modules", "**/*.d.ts", "prereq/**", "backend/**"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: process.cwd(),
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      react: react,
      import: importPlugin,
    },
    rules: {
      // Enhanced refactoring rules
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-var-requires": "error",

      // Import optimization
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],

      // Code consistency
      "object-shorthand": "error",
      "prefer-template": "error",
      "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
      "prefer-arrow-callback": "error",
      "prefer-const": "error",

      // React specific refactoring
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react/prop-types": "off", // Using TypeScript instead

      // Performance optimizations
      "react/jsx-no-bind": [
        "error",
        {
          allowArrowFunctions: true,
          allowFunctions: false,
          allowBind: false,
        },
      ],

      // Code quality improvements
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",

      // React component optimization
      "react/jsx-boolean-value": ["error", "never"],
      "react/jsx-curly-brace-presence": [
        "error",
        { props: "never", children: "never" },
      ],
      "react/self-closing-comp": "error",

      // Import cleanup
      "import/no-duplicates": "error",
      "import/no-unused-modules": "error",
      "import/newline-after-import": "error",

      // General code improvements
      "no-duplicate-imports": "error",
      "no-var": "error",
      "no-multiple-empty-lines": ["error", { max: 1, maxEOF: 1 }],
      "eol-last": "error",

      // Indian market standards enforcement
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

      // Design system compliance
      "no-restricted-syntax": [
        "error",
        {
          selector: "Literal[value=/#[0-9A-Fa-f]{6}/]",
          message: "Use semantic color tokens instead of hardcoded hex colors",
        },
      ],

      // Import organization for better maintainability
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

  // Specific rules for test files
  {
    files: ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "react/jsx-no-bind": "off",
    },
  },

  // Specific rules for configuration files
  {
    files: [
      "*.config.{js,ts}",
      "vite.config.{js,ts}",
      "tailwind.config.{js,ts}",
    ],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  // Specific rules for utility files
  {
    files: ["src/lib/**/*.{ts,tsx}", "src/utils/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "warn",
      "@typescript-eslint/explicit-module-boundary-types": "warn",
    },
  },

  // Specific rules for React components
  {
    files: ["src/components/**/*.{ts,tsx}", "src/pages/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "allow",
        },
        {
          selector: "variable",
          format: ["camelCase", "UPPER_CASE", "PascalCase"],
          leadingUnderscore: "allow",
        },
      ],
    },
  },
);
