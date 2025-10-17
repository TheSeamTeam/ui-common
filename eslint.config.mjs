// @ts-check

import process from 'node:process'

import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'
import storybook from 'eslint-plugin-storybook'
import angular from 'angular-eslint'

// import importPlugin from 'eslint-plugin-import'
import pluginPromise from 'eslint-plugin-promise'
import nodePlugin from 'eslint-plugin-n'

export default defineConfig(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  tseslint.configs.stylistic,
  // @ts-expect-error // Seems related to: https://github.com/typescript-eslint/typescript-eslint/issues/11543
  angular.configs.tsRecommended,
  // importPlugin.flatConfigs.recommended, // TODO: Decide if we want to use this.
  storybook.configs['flat/recommended'],
  {
    plugins: {
      '@stylistic': stylistic,
    },
    files: ['{src,projects,scripts,.storybook}/**/*.{ts,js,mjs}'],
    extends: [
      // @ts-expect-error // The 'eslint-plugin-promise' config is defined in a way that Typescript is unable to notice it has a `configs` property.
      pluginPromise.configs['flat/recommended'],
      nodePlugin.configs['flat/recommended-script'],
    ],
    ignores: [
      // '**/*.scss',
      // '**/*.html',
      // '!.storybook',
      'node_modules/**/*',
    ],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      'accessor-pairs': 'off',
      // 'arrow-body-style': ['error', 'as-needed'],
      camelcase: ['error', { properties: 'never' }], // TODO: Consider changing to 'always'
      // 'complexity': ['error', 10],
      complexity: 'off',
      // 'curly': ['error', 'multi-line'], // NOTE: Use prettier?
      'dot-notation': 'off',
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'guard-for-in': 'error',
      // 'id-blacklist': [ 'error', 'any', 'Number', 'number', 'String', 'string', 'Boolean', 'boolean', 'Undefined', 'undefined' ],
      // 'id-match': 'error',
      'new-cap': [
        'error',
        { newIsCap: true, capIsNew: false, properties: false },
      ],
      'no-bitwise': 'error',
      'no-array-constructor': 'error',
      'no-caller': 'error',
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-console': 'warn',
      'no-empty': 'error',
      'no-empty-function': 'off', // TODO: Consider enabling
      'no-eval': 'error',
      'no-extend-native': 'error',
      'no-extra-bind': 'error',
      'no-extra-boolean-cast': 'error',
      'no-implied-eval': 'error',
      'no-inner-declarations': ['error', 'functions'],
      'no-invalid-this': 'error',
      'no-iterator': 'error',
      'no-label-var': 'error',
      'no-labels': ['error', { allowLoop: false, allowSwitch: false }],
      'no-lone-blocks': 'error',
      'no-multi-str': 'error',
      'no-new': 'error',
      'no-new-func': 'error',
      'no-object-constructor': 'error',
      'no-new-native-nonconstructor': 'error',
      'no-new-wrappers': 'error',
      'no-octal': 'error',
      'no-octal-escape': 'error',
      'no-proto': 'error',
      'no-param-reassign': 'error',
      // 'no-return-assign': ['error', 'except-parens'],
      'no-return-assign': 'off',
      'no-self-compare': 'error',
      'no-sequences': 'error',
      'no-shadow': 'error',
      'no-template-curly-in-string': 'error',
      'no-throw-literal': 'error',
      'no-undef': 'off', // Typescript compiler should handle this.
      'no-undef-init': 'error',
      'no-unmodified-loop-condition': 'error',
      'no-unneeded-ternary': ['error', { defaultAssignment: false }],
      'no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      'no-unused-vars': 'off',
      'no-use-before-define': 'off',
      'no-useless-call': 'error',
      'no-useless-computed-key': 'error',
      'no-useless-concat': 'error',
      // 'no-useless-constructor': 'error',
      'no-useless-rename': 'error',
      'no-useless-return': 'error',
      'no-var': 'error',
      // 'object-shorthand': 'error',
      'object-shorthand': 'off',
      'prefer-arrow-callback': 'error',
      'prefer-const': 'error',
      'prefer-object-spread': 'error',
      'prefer-template': 'off', // auto-fix is bugged, so disable for now.
      radix: 'error',
      'no-underscore-dangle': 'off',
      'one-var': ['error', { initialized: 'never' }],
      'prefer-promise-reject-errors': 'error',
      'symbol-description': 'error',
      'unicode-bom': ['error', 'never'],
      'valid-typeof': ['error', { requireStringLiterals: true }],
      yoda: ['error', 'never'],
      // 'sort-imports': ['error', { 'allowSeparatedGroups': true }],
      'sort-imports': 'off', // TODO: Consider enabling. This may need a different rule to configure better.

      // '@stylistic/semi': 'off', // NOTE: Use prettier
      // '@stylistic/semi-spacing': ['error', { 'before': false, 'after': true }], // NOTE: Use prettier
      // '@stylistic/quotes': ['error', 'single', { 'avoidEscape': true, 'allowTemplateLiterals': 'always' }], // NOTE: Use prettier?
      // '@stylistic/arrow-parens': ['error', 'as-needed'], // NOTE: Use prettier
      // '@stylistic/arrow-spacing': ['error', { 'before': true, 'after': true }], // NOTE: Use prettier
      // '@stylistic/indent': ['error', 2, {
      //   'SwitchCase': 1,
      // }], // NOTE: Use prettier?
      // '@stylistic/block-spacing': ['error', 'always'], // NOTE: Use prettier
      // '@stylistic/brace-style': ['error', '1tbs', { 'allowSingleLine': true }], // NOTE: Use prettier
      // '@stylistic/comma-dangle': ['error', 'always-multiline'], // NOTE: Use prettier
      // '@stylistic/comma-spacing': ['error', { 'before': false, 'after': true }], // NOTE: Use prettier
      // '@stylistic/comma-style': ['error', 'last'], // NOTE: Use prettier
      // '@stylistic/dot-location': ['error', 'property'], // NOTE: Use prettier
      // '@stylistic/eol-last': ['error', 'always'], // NOTE: Use prettier
      // '@stylistic/linebreak-style': ['error', 'unix'], // NOTE: Use prettier
      // '@stylistic/function-call-spacing': ['error', 'never'], // NOTE: Use prettier
      // '@stylistic/generator-star-spacing': ['error', 'before'], // NOTE: Use prettier
      // '@stylistic/key-spacing': ['error', { 'beforeColon': false, 'afterColon': true }], // NOTE: Use prettier
      // '@stylistic/keyword-spacing': ['error', { 'before': true, 'after': true }], // NOTE: Use prettier
      // '@stylistic/max-len': ['error', {'code': 140, 'ignoreComments': true}], // NOTE: Use prettier?
      // '@stylistic/max-len': 'off', // NOTE: Use prettier?
      // '@stylistic/new-parens': ['error', 'always'], // NOTE: Use prettier
      // '@stylistic/no-extra-parens': ['error', 'functions'], // NOTE: Use prettier
      // '@stylistic/no-extra-semi': 'error', // NOTE: Use prettier
      // '@stylistic/no-floating-decimal': 'error', // NOTE: Use prettier
      // '@stylistic/no-mixed-operators': ['error', {
      //   'groups': [
      //     ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
      //     ['&&', '||'],
      //     ['in', 'instanceof'],
      //   ],
      //   'allowSamePrecedence': true,
      // }], // NOTE: Use prettier?
      // '@stylistic/no-mixed-spaces-and-tabs': 'error', // NOTE: Use prettier
      // '@stylistic/no-multi-spaces': 'error', // NOTE: Use prettier
      // '@stylistic/no-multiple-empty-lines': ['error', { 'max': 1, 'maxEOF': 0 }], // NOTE: Use prettier
      // '@stylistic/no-tabs': 'error', // NOTE: Use prettier?
      // '@stylistic/no-trailing-spaces': 'error', // NOTE: Use prettier
      // '@stylistic/no-whitespace-before-property': 'error', // NOTE: Use prettier
      // '@stylistic/object-curly-spacing': ['error', 'always'], // NOTE: Use prettier
      // '@stylistic/object-property-newline': ['error', { 'allowMultiplePropertiesPerLine': true }],
      // '@stylistic/object-property-newline': 'off', // NOTE: Use prettier
      // '@stylistic/operator-linebreak': ['error', 'after', { 'overrides': { '?': 'before', ':': 'before' } }], // NOTE: Use prettier
      // '@stylistic/padded-blocks': ['error', { 'blocks': 'never', 'switches': 'never', 'classes': 'always' }], // TODO: Decide on a rule for 'classes'.
      // '@stylistic/padded-blocks': ['error', { 'blocks': 'never', 'switches': 'never' }], // NOTE: Use prettier
      // '@stylistic/rest-spread-spacing': ['error', 'never'], // NOTE: Use prettier
      // '@stylistic/space-before-blocks': ['error', 'always'], // NOTE: Use prettier
      // '@stylistic/space-before-function-paren': ['error', { 'anonymous': 'never', 'named': 'never', 'asyncArrow': 'always' }], // NOTE: Use prettier
      // '@stylistic/space-in-parens': ['error', 'never'], // NOTE: Use prettier
      // '@stylistic/space-infix-ops': 'error', // NOTE: Use prettier
      // '@stylistic/space-unary-ops': ['error', { 'words': true, 'nonwords': false }], // NOTE: Use prettier
      // '@stylistic/spaced-comment': ['error', 'always', {
      //   'line': { 'markers': ['*package', '!', '/', ',', '='] },
      //   'block': { 'balanced': true, 'markers': ['*package', '!', ',', ':', '::', 'flow-include'], 'exceptions': ['*'] }
      // }],
      '@stylistic/spaced-comment': 'off', // TODO: Consider enabling.
      // '@stylistic/template-curly-spacing': 'off', // This missed an ending bracket that caused worse consistency, so disabling for now. // NOTE: Use prettier
      // '@stylistic/template-tag-spacing': ['error', 'never'], // NOTE: Use prettier
      // '@stylistic/wrap-iife': ['error', 'any', { 'functionPrototypeMethods': true }], // NOTE: Use prettier
      // '@stylistic/yield-star-spacing': ['error', 'both'], // NOTE: Use prettier

      // 'import/export': 'error',
      // 'import/first': 'error',
      // // 'import/no-duplicates': 'error', // VERY slow
      // 'import/no-named-default': 'error',
      // 'import/no-webpack-loader-syntax': 'error',
      // // 'import/order': ['error', {
      // //   'alphabetize': {
      // //     'order': 'asc',
      // //     'caseInsensitive': true
      // //   },
      // //   'groups': [
      // //     'builtin',
      // //     'external',
      // //     'internal',
      // //     'parent',
      // //     'sibling',
      // //     'index'
      // //   ],
      // //   'pathGroups': [
      // //     {
      // //       'pattern': '@storybook/**',
      // //       'group': 'external',
      // //       'position': 'before'
      // //     },
      // //     {
      // //       'pattern': '@angular/**',
      // //       'group': 'external',
      // //       'position': 'before'
      // //     },
      // //     {
      // //       'pattern': 'rxjs',
      // //       'group': 'external',
      // //       'position': 'before'
      // //     },
      // //     {
      // //       'pattern': 'rxjs/**',
      // //       'group': 'external',
      // //       'position': 'before'
      // //     },

      // //     {
      // //       'pattern': '@lib/**',
      // //       'group': 'internal',
      // //       'position': 'before'
      // //     },
      // //     {
      // //       'pattern': '@app/**',
      // //       'group': 'internal',
      // //       'position': 'before'
      // //     }
      // //   ],
      // //   'pathGroupsExcludedImportTypes': ['builtin']
      // // }],

      // 'node/no-deprecated-api': 'error',
      // 'node/process-exit-as-throw': 'error',

      'promise/param-names': 'error',
      'promise/always-return': 'off',
      'promise/catch-or-return': 'off',

      // 'standard/array-bracket-even-spacing': ['error', 'either'],
      // 'standard/computed-property-even-spacing': ['error', 'even'],
      // 'standard/no-callback-literal': 'error',
      // 'standard/object-curly-even-spacing': ['error', 'either'],

      // '@typescript-eslint/consistent-type-assertions': ['error', {'assertionStyle': 'as'}],
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-member-accessibility': 'off',
      '@typescript-eslint/interface-name-prefix': [
        'off',
        { prefixWithI: 'always' },
      ],
      // '@typescript-eslint/member-ordering': ['error', {
      //   'default': [
      //     'public-static-field',
      //     'public-static-method',
      //     'protected-static-field',
      //     'protected-static-method',
      //     'private-static-field',
      //     'private-static-method',
      //     'public-instance-field',
      //     'protected-instance-field',
      //     'private-instance-field',
      //     'constructor',
      //     'public-instance-method',
      //     'protected-instance-method',
      //     'private-instance-method'
      //   ]
      // }],
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': [
        'error',
        { ignoreParameters: true },
      ],
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-parameter-properties': 'off',
      '@typescript-eslint/no-shadow': 'warn',
      '@typescript-eslint/no-var-requires': 'off',
      // '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/triple-slash-reference': [
        'error',
        { path: 'always', types: 'prefer-import' },
      ],
      '@typescript-eslint/unified-signatures': 'error',
      '@typescript-eslint/no-useless-constructor': 'error',
      // '@typescript-eslint/no-unused-vars': ['error', { 'vars': 'all', 'args': 'none', 'ignoreRestSiblings': true }],
      '@typescript-eslint/no-unused-vars': 'off',
      // '@typescript-eslint/no-use-before-define': ['error', { 'classes': true, 'functions': false, 'variables': true }]
      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/consistent-indexed-object-style': 'off', // Undecided if we want to enforce this.

      // 'n/handle-callback-err': [ 'error', '^(err|error)$' ],
      'n/handle-callback-err': 'off', // TODO: Consider enabling
      'n/no-new-require': 'error',
      'n/no-path-concat': 'error',
      'n/no-missing-import': 'off', // TODO: Check why this is giving a lot of false positives. Assumption: Because Typescript handles imports, this rule is not needed.
      'n/no-extraneous-import': 'off', // This seems to check the closest package.json, which seems too restricted for our project.
      'n/no-extraneous-require': 'off', // Slow and probably not worth the performance cost.
      'n/no-unsupported-features/node-builtins': 'off', // Likely not relevant for our project.
      'n/no-unpublished-import': 'off', // Very slow.

      '@angular-eslint/prefer-inject': 'off', // TODO: Enable after more is migrated.
      '@angular-eslint/prefer-standalone': 'off', // TODO: Enable after more is migrated.
    },
  },
  // All Angular typescript files
  {
    files: ['{src,projects}/**/*.{ts,js,mjs}'],
    ignores: ['**/*.spec.ts', '**/*.stories.ts'],
    // IMPORTANT: Set the custom processor to enable inline template linting
    // This allows your inline Component templates to be extracted and linted with the same
    // rules as your external .html template files
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/no-empty-lifecycle-method': 'off', // TODO: Consider enabling
      '@angular-eslint/no-inputs-metadata-property': 'off',
    },
  },
  // App Angular files
  {
    files: ['src/**/*.{ts,js,mjs}'],
    ignores: ['**/*.spec.ts', '**/*.stories.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],
    },
  },
  // Lib angular files
  {
    files: ['projects/**/*.{ts,js,mjs}'],
    ignores: ['**/*.spec.ts', '**/*.stories.ts'],
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'seam',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'seam',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    // Everything in this config object targets our HTML files (both external template files,
    // AND inline templates thanks to the processor set in the TypeScript config above)
    files: ['{src,projects,scripts,.storybook}/**/*.html'],
    ignores: [
      'src/index.html', // Ignore index.html since it's not an Angular template.
      'src/index.prod.html',
    ],
    extends: [
      // Apply the recommended Angular template rules
      ...angular.configs.templateRecommended,
      // Apply the Angular template rules which focus on accessibility of our apps
      ...angular.configs.templateAccessibility,
    ],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off', // Threw error on html file, which shouldn't need this rule anyway, as far as I know.
      '@typescript-eslint/adjacent-overload-signatures': 'off', // Threw error on html file, which shouldn't need this rule anyway, as far as I know.
      '@angular-eslint/template/no-negated-async': 'off', // TODO: Consider enabling. Currently, we have a lot of places that intentionally rely on the falsy logic that can't be auto fixed.
      '@angular-eslint/template/click-events-have-key-events': 'off', // TODO: Consider enabling. Likely will not be a straighforward fix.
      '@angular-eslint/template/label-has-associated-control': 'off', // TODO: Consider enabling. Likely will not be a straighforward fix.
      '@angular-eslint/template/interactive-supports-focus': 'off', // TODO: Consider enabling. Likely will not be a straighforward fix.
      '@angular-eslint/template/elements-content': 'off', // TODO: Consider enabling. May be too strict.
    },
  },
)
