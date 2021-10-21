// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// When a command from ./commands is ready to use, import with `import './commands'` syntax
// import './commands';

import '@jscutlery/cypress-angular/support'

// import { cypressGlobalSetup } from '@theseam/ui-common/test-helpers'

// cypressGlobalSetup()


import { setGlobalConfig } from '@storybook/testing-angular'
import * as globalStorybookConfig from '../../../../.storybook/preview' // path of your preview.js file

// import { cypressGlobalStyles } from './cypress-global-styles'

import { Component, ViewEncapsulation } from '@angular/core'
import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular'

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'global-styles-wrapper',
  template: `<ng-content></ng-content>`,
  styleUrls: [
    '../../styles/theme.scss',
    '../../../../node_modules/@marklb/ngx-datatable/assets/icons.css'
  ],
  encapsulation: ViewEncapsulation.None
})
class GlobalStylesWrapperComponent { }

/**
 * Work around to load global styles in Cypress Component Testing.
 */
export const cypressGlobalStyles = (storyFn: any, storyContext: any) => {
  const meta = moduleMetadata({ declarations: [ GlobalStylesWrapperComponent ] })
  return componentWrapperDecorator(GlobalStylesWrapperComponent)(
    () => meta(storyFn, storyContext),
    storyContext
  )
}

export function cypressGlobalSetup(): void {
  setGlobalConfig({
    ...globalStorybookConfig,
    decorators: [
      ...((globalStorybookConfig as any)?.decorators || []),
      cypressGlobalStyles
    ]
  })
}
