import { defineConfig } from 'eslint-define-config';
import reactPlugin from 'eslint-plugin-react';
import babelParser from '@babel/eslint-parser';

export default defineConfig({
  languageOptions: {
    parser: babelParser, // Используем Babel для парсинга
    parserOptions: {
      requireConfigFile: false, // Не требует конфигурационный файл Babel
      ecmaVersion: 'latest',    // Используем последние возможности ECMAScript
      sourceType: 'module',     // Для работы с модулями ES6
      ecmaFeatures: {
        jsx: true,              // Включаем поддержку JSX
      },
    },
  },
  plugins: {
    react: reactPlugin,         // Подключаем плагин для React
  },
  rules: {
    'react/prop-types': 'off',  // Пример отключения правила (если не используете prop-types)
    // Добавьте другие правила по необходимости
  },
  settings: {
    react: {
      version: 'detect',        // Автоматически определяет версию React
    },
  },
  // Прямое расширение конфигураций
  overrides: [
    {
      files: ['*.js', '*.jsx'], // Применяем для всех файлов JS и JSX
      rules: {
        'react/prop-types': 'off',
      },
    },
  ],
});

