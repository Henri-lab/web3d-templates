/**
 * ESLint 配置
 *
 * 目标：
 * - 严格检查未使用变量 / 参数（配合 TypeScript 的 noUnusedLocals/noUnusedParameters）
 * - 适配 React + TypeScript + Vite
 * - 与 Prettier 配合：风格统一由 Prettier 负责，这里不做格式类规则
 */

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: ['./tsconfig.json'],
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
  plugins: ['@typescript-eslint', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  rules: {
    // 未使用变量：TypeScript + ESLint 双重兜底
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],

    // 允许在开发中使用 console（你在调试 React 源码时会很常用）
    'no-console': 'off',

    // 其他规则按需再补充
  },
}

