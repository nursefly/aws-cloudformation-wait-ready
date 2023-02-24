module.exports = {
  env: {
    browser: false,
    es2021: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'airbnb',
    'plugin:import/typescript',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
    'import/resolver': {
      typescript: {
        project: `${__dirname}/tsconfig.json`,
      },
    },
  },
  rules: {
    'import/extensions': ['off'],
    'import/prefer-default-export': ['off'],
    'import/no-default-export': ['error'],
    'no-restricted-syntax': ['off'],
    'no-unused-vars': ['off'],
    '@typescript-eslint/no-unused-vars': ['error'],
  },
};
