import { defineConfig } from 'eslint-define-config';

export default defineConfig({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
  'no-console': 'warn', 
  'no-unused-vars': 'error', 
  'eqeqeq': 'error',
  },
});

