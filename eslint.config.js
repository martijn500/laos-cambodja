import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/",
      "img/",
      "dist/",
      "test-results/",
      "playwright-report/",
    ],
  },
  js.configs.recommended,
  {
    files: ["js/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: globals.browser,
    },
  },
  {
    files: ["*.js", "scripts/**/*.js"],
    languageOptions: { sourceType: "module", globals: globals.node },
  },
  {
    // Tests run in Node but pass functions to the browser (page.evaluate)
    files: ["tests/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "prefer-const": "error",
      eqeqeq: ["error", "smart"],
    },
  },
];
