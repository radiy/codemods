'use strict'

module.exports = {
  parserOptions: {
    ecmaVersion: 8,
  },
  env: {
    node: true,
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended'],
  rules: {
    eqeqeq: 'error',
    'object-shorthand': ['error', 'always'],
    'prefer-const': 'error',
    strict: 'error',
    'prettier/prettier': 'error',
  },
}
