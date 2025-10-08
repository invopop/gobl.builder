module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:svelte/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  ignorePatterns: ['dist', 'src/lib/wasm_exec.js', '*.cjs'],
  overrides: [
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: { parser: '@typescript-eslint/parser' }
    }
  ],
  settings: {
    'svelte/typescript': () => require('typescript')
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020
  },
  env: {
    browser: true,
    es2017: true,
    node: true
  }
}
