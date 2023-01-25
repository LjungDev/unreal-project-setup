/**
 * @type {import("eslint").Linter.Config}
 */
module.exports = {
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:jest/recommended",
    "plugin:jest/style",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "unused-imports", "import", "jest"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.json"],
    tsconfigRootDir: __dirname,
  },
  env: {
    es2021: true,
    node: true,
    jest: true,
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".ts"],
      },
      typescript: {
        alwaysTryTypes: true,
        project: "./",
      },
    },
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"],
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": ["warn"],
      "@typescript-eslint/no-floating-promises": ["error"],
      "@typescript-eslint/no-shadow": ["error"],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-use-before-define": ["error"],
      "import/no-unresolved": "error",
      "import/no-extraneous-dependencies": [
        "error",
        { devDependencies: ["**/*.test.*"] },
      ],
      "import/no-unused-modules": [1, { unusedExports: true }],
      "no-shadow": "off",
      "no-use-before-define": "off",
      "no-void": ["error", { allowAsStatement: true }],
      "react/require-default-props": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },
};
