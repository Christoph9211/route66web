// eslint.config.mjs  (flat‑config)

import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import react from "eslint-plugin-react";
import babelParser from "@babel/eslint-parser";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";                     // CommonJS default export

const { browser, es2023, node: nodeGlobals } = globals;  // destructure maps
const compat = new FlatCompat();

export default defineConfig([

  /* -------------------------------------------------------------- */
  /* Front‑end source files                                         */
  /* -------------------------------------------------------------- */
  {
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    ignores: ["dist/**"],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["@babel/preset-react", "@babel/preset-env"],
        },
      },
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...browser, ...es2023 },          // ✅ declare browser globals
    },
    plugins: { react },
    rules: {
      ...js.configs.recommended.rules,
      ...compat.extends("plugin:react/recommended").rules,
      "react/react-in-jsx-scope": "off",
    },
    settings: { react: { version: "detect" } },
  },
  {
    files: ["vite.config.{js,mjs,ts}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",            // ← tells ESLint to allow import/export
      globals: { ...globals.node, ...globals.es2023 },
    },
    rules: { ...js.configs.recommended.rules },
  },

  /* -------------------------------------------------------------- */
  /* Node‑only config / build scripts                               */
  /* -------------------------------------------------------------- */
  {
    files: ["*.config.js", "scripts/**/*.{js,cjs,mjs}"],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...nodeGlobals, ...es2023 },      // ✅ node globals here
    },
    rules: { ...js.configs.recommended.rules },
  },
]);
