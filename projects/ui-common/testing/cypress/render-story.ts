import { mount } from '@jscutlery/cypress-angular/mount'
import { createMountableStoryComponent } from '@storybook/testing-angular'

// NOTE: This is an experimental attempt at removing some of the boilerplate. If
// this ends up being worth it, then I will add it to `@storybook/testing-angular`.
export function cyRenderStory(story: any, props: any = {}): Cypress.Chainable<void> {
  const { component, ngModule } = createMountableStoryComponent(
    story({}, props)
  )
  return mount(component, { imports: [ ngModule ] })
}
