require('jest-preset-angular/ngcc-jest-processor');

const { pathsToModuleNameMapper } = require('ts-jest/utils')
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const { compilerOptions } = require('./tsconfig.spec')

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  displayName: 'ui-common',
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: [
    // TODO: Remove the specific folders when the projects tests are more stable.
    "**/breadcrumbs/**/*.spec.ts",
    "**/graphql/**/*.spec.ts",
    "**/buttons/**/*.spec.ts",
    "**/framework/side-nav/**/*.spec.ts",
    "**/utils/**/*.spec.ts",
    "**/validators/**/*.spec.ts",
  ],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: '<rootDir>/' }),
};
