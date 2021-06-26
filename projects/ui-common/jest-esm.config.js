require('jest-preset-angular/ngcc-jest-processor');

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  displayName: 'ui-common',
  preset: 'jest-preset-angular/presets/defaults-esm',
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig-esm.spec.json',
      stringifyContentPathRegex: '\\.html$',
    },
  },
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: [
    "**/graphql/**/*.spec.ts"
  ]
};
