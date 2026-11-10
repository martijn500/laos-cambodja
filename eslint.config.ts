import js from "@eslint/js";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  {
    ignores: ["dist/", "img/", "test-results/", "playwright-report/"],
  },
  js.configs.recommended,
  // Type-aware rules: they see what tsc sees (unhandled promises,
  // conditions that are always true, unsafe any…)
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: { projectService: true },
    },
    rules: {
      eqeqeq: ["error", "smart"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_" },
      ],
      // Template literals with numbers ("Dag ${day}") are fine
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        { allowNumber: true },
      ],
      // `void promise` marks a promise that is deliberately not awaited
      "@typescript-eslint/no-confusing-void-expression": [
        "error",
        { ignoreArrowShorthand: true },
      ],
    },
  },
  {
    files: ["src/**/*.ts"],
    languageOptions: { globals: globals.browser },
  },
  {
    files: ["*.ts", "tests/**/*.ts"],
    languageOptions: { globals: { ...globals.node, ...globals.browser } },
  },
);
