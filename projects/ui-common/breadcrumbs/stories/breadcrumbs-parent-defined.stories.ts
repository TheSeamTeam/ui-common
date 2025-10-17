import { Meta, StoryObj } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule, provideRouter } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'

import { provideStoryInitialUrl } from '@marklb/storybook-angular-initial-url'
import {
  StoryEmptyComponent,
  StoryEmptyWithRouteComponent,
} from '@theseam/ui-common/story-helpers'

import { TheSeamBreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

const meta: Meta<TheSeamBreadcrumbsComponent> = {
  title: 'Breadcrumbs/Components/Parent Defined',
  component: TheSeamBreadcrumbsComponent,
  decorators: [],
}

export default meta
type Story = StoryObj<TheSeamBreadcrumbsComponent>

export const Example: Story = {
  render: () => ({
    applicationConfig: {
      providers: [
        provideAnimations(),
        provideLocationMocks(),
        provideRouter([
          {
            path: 'home',
            component: StoryEmptyWithRouteComponent,
            data: {
              breadcrumb: 'Home',
            },
            children: [
              {
                path: '',
                component: StoryEmptyComponent,
              },
            ],
          },
        ]),
        provideStoryInitialUrl('/home'),
      ],
    },
    moduleMetadata: {
      declarations: [StoryEmptyWithRouteComponent],
      providers: [],
      imports: [RouterModule],
    },
    props: {},
    template: `
      <seam-breadcrumbs></seam-breadcrumbs>
      <router-outlet></router-outlet>
    `,
  }),
}
