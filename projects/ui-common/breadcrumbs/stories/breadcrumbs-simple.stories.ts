import { Meta, Story } from '@storybook/angular'

import { importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { StoryEmptyComponent, StoryInitialRouteModule } from '@theseam/ui-common/story-helpers'

import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

export default {
  title: 'Breadcrumbs/Components/Simple',
  component: BreadcrumbsComponent,
  decorators: [ ]
} as Meta

export const Example: Story = args => {
  return {
    applicationConfig: {
      providers: [
        provideAnimations(),
        importProvidersFrom(
          RouterModule.forRoot([
            {
              path: 'home',
              component: StoryEmptyComponent,
              data: {
                breadcrumb: 'Home'
              }
            }
          ], { useHash: true }),
          StoryInitialRouteModule.forRoot('/home'),
        ),
      ],
    },
    moduleMetadata: {
      declarations: [
        StoryEmptyComponent,
      ],
      providers: [ ],
      imports: [
        RouterModule,
      ],
    },
    props: { ...args },
    template: `
      <seam-breadcrumbs></seam-breadcrumbs>
      <router-outlet></router-outlet>
    `,
  }
}
