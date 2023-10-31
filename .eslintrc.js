const { resolve } = require('path');
module.exports = {
    // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
    // This option interrupts the configuration hierarchy at this file
    // Remove this if you have an higher level ESLint config file (it usually happens into a monorepos)
    root: true,

    // https://eslint.vuejs.org/user-guide/#how-to-use-custom-parser
    // Must use parserOptions instead of "parser" to allow vue-eslint-parser to keep working
    // `parser: 'vue-eslint-parser'` is already included with any 'plugin:vue/**' config and should be omitted
    parserOptions: {
        // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/parser#configuration
        // https://github.com/TypeStrong/fork-ts-checker-webpack-plugin#eslint
        // Needed to make the parser take into account 'vue' files
        extraFileExtensions: ['.vue'],
        parser: '@typescript-eslint/parser',
        project: resolve(__dirname, './tsconfig.json'),
        tsconfigRootDir: __dirname,
        ecmaVersion: 2018, // Allows for the parsing of modern ECMAScript features
        sourceType: 'module' // Allows for the use of imports
    },

    // Rules order is important, please avoid shuffling them
    extends: [
        // Base ESLint recommended rules
        // 'eslint:recommended',

        // https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#usage
        // ESLint typescript rules
        'plugin:@typescript-eslint/recommended',
        // consider disabling this class of rules if linting takes too long
        'plugin:@typescript-eslint/recommended-requiring-type-checking',

        // Uncomment any of the lines below to choose desired strictness,
        // but leave only one uncommented!
        // See https://eslint.vuejs.org/rules/#available-rules
        'plugin:vue/vue3-essential', // Priority A: Essential (Error Prevention)
        // 'plugin:vue/vue3-strongly-recommended', // Priority B: Strongly Recommended (Improving Readability)
        // 'plugin:vue/vue3-recommended', // Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead)
    ],

    plugins: [
        // required to apply rules which need type information
        '@typescript-eslint',

        // https://eslint.vuejs.org/user-guide/#why-doesn-t-it-work-on-vue-file
        // required to lint *.vue files
        'vue',
        'unused-imports',
    ],

    globals: {
        ga: 'readonly', // Google Analytics
        cordova: 'readonly',
        __statics: 'readonly',
        __QUASAR_SSR__: 'readonly',
        __QUASAR_SSR_SERVER__: 'readonly',
        __QUASAR_SSR_CLIENT__: 'readonly',
        __QUASAR_SSR_PWA__: 'readonly',
        process: 'readonly',
        Capacitor: 'readonly',
        chrome: 'readonly'
    },

    // add your custom rules here
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',

        // allow debugger during development only
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

        'comma-dangle': ['error', 'always-multiline'],
        'indent': ['error', 4],
        'quotes': ['error', 'single'],
        // 'max-len': ['error', { 'code': 120 }],
        'eol-last': ['error', 'always'],
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],
        'space-in-parens': ['error', 'never'],
        'computed-property-spacing': ['error', 'never'],
        'comma-spacing': ['error', { 'before': false, 'after': true }],
        'no-trailing-spaces': 'error',
        'eqeqeq': 'error',
        'semi': ['error', 'always'],
        'arrow-parens': [2, 'as-needed', { 'requireForBlockBody': true }],
        'arrow-body-style': ['error', 'as-needed'],
        'object-property-newline': ['error', { 'allowAllPropertiesOnSameLine': true }],
        'curly': 'error',
        'brace-style': ['error', '1tbs', { 'allowSingleLine': false }],
        'no-restricted-imports': ['error', {
            'patterns': ['.*'], // disallow relative imports
        }],
        'no-return-assign': ['error', 'always'],
        'no-param-reassign': 'error',


        'vue/html-indent': ['warn', 4, { 'baseIndent': 0 }],
        'vue/max-attributes-per-line': ['warn', {
            'singleline': {
                'max': 3,
            },
            'multiline': {
                'max': 1,
            },
        }],
        'vue/first-attribute-linebreak': ['error', {
            'singleline': 'ignore',
            'multiline': 'below',
        }],
        'vue/component-tags-order': ['error', {
            'order': ['script', 'template', 'style'],
        }],
        'vue/html-self-closing': ['error', {
            'html': {
                'void': 'never',
                'normal': 'never',
                'component': 'always',
            },
            'svg': 'always',
        }],
        'vue/multi-word-component-names': 'error',
        'vue/no-static-inline-styles': ['error', {
            'allowBinding': false,
        }],
        'vue/attributes-order': ['error', {
            'order': [
                'DEFINITION',
                'LIST_RENDERING',
                'CONDITIONALS',
                'RENDER_MODIFIERS',
                'GLOBAL',
                ['UNIQUE', 'SLOT'],
                'TWO_WAY_BINDING',
                'OTHER_DIRECTIVES',
                'OTHER_ATTR',
                'EVENTS',
                'CONTENT',
            ],
            'alphabetical': false,
        }],
        'vue/html-closing-bracket-newline': ['error', {
            'singleline': 'never',
            'multiline': 'always',
        }],
        'vue/component-options-name-casing': ['error', 'PascalCase'],
        'vue/component-definition-name-casing': ['error', 'PascalCase'],
        'vue/component-name-in-template-casing': ['error', 'PascalCase'],
        'no-unused-vars': 'off',
        'unused-imports/no-unused-imports': 'error',
        'unused-imports/no-unused-vars': [
            'warn',
            {
                'vars': 'all',
                'varsIgnorePattern': '^_',
                'args': 'after-used',
                'argsIgnorePattern': '^_'
            }
        ],
    }
}
