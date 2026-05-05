import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import esprettierRec from "eslint-plugin-prettier/recommended";
import jsxA11y from "eslint-plugin-jsx-a11y";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    extends: [
      js.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],
      esprettierRec,
      jsxA11y.flatConfigs.recommended,
      ...tseslint.configs.recommended,
    ],
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js, react },
    rules: {
      "react/display-name": "off",
      "jsx-a11y/no-autofocus": "off",
      // Relax some TypeScript strictness to avoid many build errors
      "@typescript-eslint/no-explicit-any": ["warn"],
      "@typescript-eslint/no-empty-object-type": ["warn"],
      "@typescript-eslint/no-wrapper-object-types": ["warn"],
      // Prefer-const and unused-expression/style rules as warnings
      "prefer-const": ["warn"],
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/no-unused-expressions": ["warn"],
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        ecmaFeatures: {
          jsx: true,
        },
      },
      parser: tseslint.parser,
      globals: { ...globals.browser, ...globals.node },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    ignores: ["node_modules/**", "dist"],
  },
]);
