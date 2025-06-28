import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import importPlugin from 'eslint-plugin-import';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        // React Native/Expo globals
        React: 'readonly',
        JSX: 'readonly',
        // Node.js globals
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        setImmediate: 'readonly',
        clearImmediate: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        global: 'readonly',
        // Browser globals
        requestAnimationFrame: 'readonly',
        cancelAnimationFrame: 'readonly',
        performance: 'readonly',
        self: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
      'react': react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
      'import': importPlugin,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
      'react/react-in-jsx-scope': 'off',
      // import/extensionsを緩和（React Native/Expoでは拡張子省略が一般的）
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          '': 'never',
          ts: 'never',
          tsx: 'never',
          js: 'never',
          jsx: 'never',
        },
      ],
      'import/no-unresolved': 'off',
      // 一般的なエラーを緩和
      'no-undef': 'off', // TypeScriptが型チェックするため
      'no-redeclare': 'off', // TypeScriptが処理するため
      'no-unused-vars': 'off', // @typescript-eslint/no-unused-varsを使用
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-var-requires': 'off', // CommonJSを許可
      '@typescript-eslint/no-require-imports': 'off', // CommonJSのrequire()を許可
      'no-useless-escape': 'warn',
      'no-empty': 'warn',
      'no-fallthrough': 'warn',
    },
    settings: {
      react: {
        version: 'detect',
      },
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
  },
  {
    ignores: [
      'node_modules/',
      'dist/',
      'build/',
      '*.config.js',
      '.expo/',
      'Tsuuwa/.expo/',
      '**/.expo/',
      '.yarn/',
      'node_modules/.yarn-integrity',
      'yarn-error.log',
      '.pnp.*',
      'frontend/',
    ],
  },
];