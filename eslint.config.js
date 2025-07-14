import js from "@eslint/js";

export default [
  {
    files: ["**/*.{js,jsx}"],
    ignores: ["dist/**/*"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: "readonly",
        ReactDOM: "readonly",
        document: "readonly",
        localStorage: "readonly",
        window: "readonly",
        fetch: "readonly",
        console: "readonly",
      },
    },
  },
];
