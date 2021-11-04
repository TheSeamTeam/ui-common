// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/dist/zone'  // Included with Angular CLI.


import 'zone.js/dist/zone-testing'

import { getTestBed } from '@angular/core/testing'
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing'

// import { setGlobalConfig } from '@storybook/testing-angular'
// import * as globalStorybookConfig from '../../.storybook/preview' // path of your preview.js file

declare const require: {
  context(path: string, deep?: boolean, filter?: RegExp): {
    keys(): string[];
    <T>(id: string): T;
  }
}

// setGlobalConfig(globalStorybookConfig as any) // Error looks like a Typescript inference issue.

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting()
)
// Then we find all the tests.
const context = require.context('./', true, /\.ka-spec\.ts$/)
// And load the modules.
context.keys().map(context)

