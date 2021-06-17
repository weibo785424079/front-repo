module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
  ],
  rules: {
    'no-use-before-define': 0,
    'import/no-extraneous-dependencies': 0,
    'react/jsx-props-no-spreading': 0,
    'react/jsx-filename-extension': [2, { extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'] }],
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': ['error'],
    'import/extensions': ['error', 'never', { svg: 'always' }],
  },
};
