import type { Config } from 'jest'
import { createCjsPreset } from 'jest-preset-angular/presets/index.js'

import { pathsToModuleNameMapper } from 'ts-jest'
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
import { compilerOptions } from './tsconfig.spec.json'

// ESM-only packages that Jest must transform (file-type, shpjs, d3, and their deps).
const esmPackages = [
  'file-type',
  '@tokenizer/inflate',
  'token-types',
  '@borewit/text-codec',
  'strtok3',
  'uint8array-extras',
  'shpjs',
  'but-unzip',
  'parsedbf',
  'wkt-parser',
  'd3-geo',
  'd3-selection',
  'd3-array',
  'internmap',
]

export default {
  ...createCjsPreset(),
  transformIgnorePatterns: [
    `node_modules/(?!(.*\\.mjs$|@angular/common/locales/.*\\.js$|${esmPackages.join('|')}))`,
  ],
  displayName: 'ui-common',
  // preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  // globalSetup: 'jest-preset-angular/global-setup',
  testMatch: [
    // TODO: Remove the specific folders when the projects tests are more stable.
    '**/breadcrumbs/**/*.spec.ts',
    '**/graphql/**/*.spec.ts',
    '**/buttons/**/*.spec.ts',
    // '**/framework/side-nav/**/*.spec.ts',
    '**/framework/form/**/*.spec.ts',
    '**/utils/**/*.spec.ts',
    '**/validators/**/*.spec.ts',
    '**/datatable/**/*.spec.ts',
    '**/dynamic-component-loader/**/*.spec.ts',
    '**/tel-input/**/*.spec.ts',
    '**/tooltip/**/*.spec.ts',
    '**/tabbed/**/*.spec.ts',
    '**/layout/**/*.spec.ts',
    '**/datatable-alterations-display/**/*.spec.ts',
    '**/route-transitions/**/*.spec.ts',
    '**/progress/**/*.spec.ts',
    '**/states-counties-map/**/*.spec.ts',
  ],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
} satisfies Config
