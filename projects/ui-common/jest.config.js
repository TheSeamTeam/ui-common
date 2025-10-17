// require('jest-preset-angular/ngcc-jest-processor');

import { pathsToModuleNameMapper } from 'ts-jest'
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
import { compilerOptions } from './tsconfig.spec'

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  displayName: 'ui-common',
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  globalSetup: 'jest-preset-angular/global-setup',
  testMatch: [
    // TODO: Remove the specific folders when the projects tests are more stable.
    '**/breadcrumbs/**/*.spec.ts',
    // '**/graphql/**/*.spec.ts',
    '**/buttons/**/*.spec.ts',
    // '**/framework/side-nav/**/*.spec.ts',
    '**/utils/**/*.spec.ts',
    '**/validators/**/*.spec.ts',
    '**/datatable/**/*.spec.ts',
    '**/dynamic-component-loader/**/*.spec.ts',
    '**/tel-input/**/*.spec.ts',
    '**/tooltip/**/*.spec.ts',
    '**/tabbed/**/*.spec.ts',
    '**/datatable-alterations-display/**/*.spec.ts',
  ],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/',
  }),
}
