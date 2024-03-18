module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    "plugin:jsx-a11y/recommended",
    "airbnb",
    'airbnb-typescript',
    "airbnb/hooks",
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  "parserOptions": {
    "sourceType": "module",
    project: ['./tsconfig.json']
  },
  plugins: ['react-refresh'],
  "settings": {
    "react": {
      "version": "detect"
    },
    "propWrapperFunctions": [],
    "linkComponents": []
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/jsx-uses-react": "off",
    "import/extensions": "off",
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
  },
}
