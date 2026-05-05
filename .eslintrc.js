module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:react-native/all',
    'prettier'
  ],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'react-native', 'import', 'prettier'],
  rules: {
    'prettier/prettier': 'error',
    'react-hooks/exhaustive-deps': 'error',
    'react/react-in-jsx-scope': 'off', // Not needed in typical recent React
    'react/prop-types': 'off',
    '@typescript-eslint/no-explicit-any': 'error'
  },
  settings: {
    react: {
      version: 'detect'
    }
  },
  env: {
    'react-native/react-native': true
  }
};
