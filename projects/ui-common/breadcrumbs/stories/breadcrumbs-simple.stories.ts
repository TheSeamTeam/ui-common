import { Meta, StoryObj } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule, provideRouter } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'

import { provideStoryInitialUrl } from '@marklb/storybook-angular-initial-url'
import { StoryEmptyComponent } from '@theseam/ui-common/story-helpers'

import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

const meta: Meta<BreadcrumbsComponent> = {
  title: 'Breadcrumbs/Components/Simple',
  component: BreadcrumbsComponent,
  decorators: [ ]
}

export default meta
type Story = StoryObj<BreadcrumbsComponent>

export const Example: Story = {
  render: args => {
    return {
      applicationConfig: {
        providers: [
          provideAnimations(),
          provideLocationMocks(),
          provideRouter([
            {
              path: 'home',
              component: StoryEmptyComponent,
              data: {
                breadcrumb: 'Home'
              }
            }
          ]),
          provideStoryInitialUrl('/home'),
        ],
      },
      moduleMetadata: {
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
  },
}
