import js from "@eslint/js";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  {
    ...reactPlugin.configs.flat.recommended,
    settings: { react: { version: "19.0.0" } },
  },
  {
    files: ["**/*.{js,jsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.es2022 },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react/prop-types": "off",                    // no PropTypes required
      "react/react-in-jsx-scope": "off",            // React 17+ JSX transform
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "no-console": ["warn", { allow: ["error", "warn"] }],
      "react-hooks/set-state-in-effect": "off",     // allow setState in init/reset effects
    },
  },
];
