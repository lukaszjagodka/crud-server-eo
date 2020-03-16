module.exports = {
  env: {
    browser: false,
    es6: true,
    node: true,
  },
  extends: [
    'plugin:react/recommended',
    'airbnb',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  plugins: [
    'react',
    'eslint-plugin-node'
  ],
  rules: {
    "no-console": "off",
    "indent": ["error", 2],
    semi: "error",
    quotes: ["error", "single"]
  },
};
