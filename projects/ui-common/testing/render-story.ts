import { createMountableStoryComponent } from '@storybook/testing-angular'
import { render, RenderResult } from '@testing-library/angular'

// NOTE: This is an experimental attempt at removing some of the boilerplate. If
// this ends up being worth it, then I will add it to `@storybook/testing-angular`.
export async function renderStory<ComponentType = any>(story: any): Promise<RenderResult<ComponentType, ComponentType>> {
  const { component, ngModule } = createMountableStoryComponent(
    story({}, {} as any)
  )
  return await render(component, { imports: [ ngModule ] })
}
