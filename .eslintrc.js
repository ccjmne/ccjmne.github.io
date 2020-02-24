module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: 'airbnb-base',
  parserOptions: {
    project: './tsconfig.json',
  },
  rules: {
    'quote-props': ['error', 'consistent-as-needed'],
    'no-unused-vars': 'off',
    'object-curly-newline': ['error', {
      ImportDeclaration: 'never',
      ObjectExpression: { consistent: true, multiline: true },
      ObjectPattern: { consistent: true, multiline: true },
    }],
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars-experimental': 'error',
  },
};
