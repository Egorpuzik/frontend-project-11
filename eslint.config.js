import { defineConfig } from 'eslint-define-config';
import reactPlugin from 'eslint-plugin-react';
import babelParser from '@babel/eslint-parser';

export default defineConfig({
  languageOptions: {
    parser: babelParser, // Используем Babel для парсинга
    parserOptions: {
      requireConfigFile: false,
      ecmaVersion: 'latest',
      sourceType: 'module',
      plugins: ['jsx'], // Плагин для JSX
    },
  },
  plugins: {
    react: reactPlugin,
  },
  rules: {
    'react/prop-types': 'off', // Пример отключения правила
    // Добавьте другие правила по необходимости
  },
  settings: {
    react: {
      version: 'detect',
    },
  },
});

