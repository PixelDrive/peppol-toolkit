import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turboPlugin from 'eslint-plugin-turbo';
import sonarjs from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

const eslintConfig =  [
    js.configs.recommended,
    eslintConfigPrettier,
    ...tseslint.configs.recommended,
    {
        plugins: {
            turbo: turboPlugin,
        },
        rules: {
            'turbo/no-undeclared-env-vars': 'off',
        },
    },
    {
        plugins: { sonarjs },
        rules: {
            'sonarjs/no-duplicate-string': 'off',
            'sonarjs/cognitive-complexity': 'warn',
            'sonarjs/no-small-switch': 'warn',
        },
    },

    {
        ignores: ['dist/**'],
    },
    {
        rules: {
            'no-var': 'error',
            'prefer-const': 'error',
            'func-call-spacing': ['error', 'never'],
            'key-spacing': ['error', { beforeColon: false, afterColon: true }],
            'no-debugger': 'error',
            'no-dupe-keys': 'error',
            'no-with': 'error',
            eqeqeq: ['error', 'always'],
            quotes: ['error', 'single', { avoidEscape: true }],
            'no-unused-vars': 'off',
            camelcase: ['error', { properties: 'never' }],
            'no-duplicate-imports': 'error',
            'require-await': 'error',
            'no-undef': 'off',
        },
    },
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        rules: {
            '@typescript-eslint/no-non-null-assertion': 'off',
            'require-await': 'error',
            '@typescript-eslint/prefer-nullish-coalescing': 'error',
            '@typescript-eslint/no-unused-expressions': 'error',
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': [
                'error',
                { checksVoidReturn: false },
            ],
            '@typescript-eslint/no-unused-vars': 'error',
            '@typescript-eslint/array-type': 'error',
            '@typescript-eslint/ban-ts-comment': [
                'error',
                {
                    'ts-expect-error': 'allow-with-description',
                    'ts-ignore': 'allow-with-description',
                    'ts-nocheck': 'allow-with-description',
                    'ts-check': false,
                },
            ],
            '@typescript-eslint/no-require-imports': 'error',
            '@typescript-eslint/prefer-as-const': 'error',
            '@typescript-eslint/no-this-alias': 'error',
            '@typescript-eslint/prefer-for-of': 'error',
            '@typescript-eslint/no-empty-object-type': 'error',
            '@typescript-eslint/no-unsafe-function-type': 'error',
            '@typescript-eslint/no-unsafe-argument': 'warn',
            '@typescript-eslint/no-wrapper-object-types': 'error',
            '@typescript-eslint/no-explicit-any': 'warn',
        },
    },
];

export default eslintConfig;