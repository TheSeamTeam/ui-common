import { Component, ViewEncapsulation } from '@angular/core'
import { componentWrapperDecorator, moduleMetadata } from '@storybook/angular'

@Component({
  // tslint:disable-next-line: component-selector
  selector: 'global-styles-wrapper',
  template: `<ng-content></ng-content>`,
  styleUrls: [
    '../styles/theme.scss',
    '../../../node_modules/@marklb/ngx-datatable/assets/icons.css'
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
