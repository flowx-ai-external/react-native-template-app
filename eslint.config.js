import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactNative from 'eslint-plugin-react-native'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', '.expo', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-native': reactNative,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-native/no-unused-styles': 'warn',
      'react-native/no-raw-text': 'off',
    },
  },
)
