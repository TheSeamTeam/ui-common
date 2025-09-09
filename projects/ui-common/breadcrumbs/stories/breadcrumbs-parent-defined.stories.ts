import { Meta, StoryObj } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule, provideRouter } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'

import { provideStoryInitialUrl } from '@marklb/storybook-angular-initial-url'
import { StoryEmptyComponent, StoryEmptyWithRouteComponent } from '@theseam/ui-common/story-helpers'

import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

const meta: Meta<BreadcrumbsComponent> = {
  title: 'Breadcrumbs/Components/Parent Defined',
  component: BreadcrumbsComponent,
  decorators: [],
}

export default meta
type Story = StoryObj<BreadcrumbsComponent>

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
      declarations: [
        StoryEmptyWithRouteComponent,
      ],
      providers: [ ],
      imports: [
        RouterModule,
      ],
    },
    props: { },
    template: `
      <seam-breadcrumbs></seam-breadcrumbs>
      <router-outlet></router-outlet>
    `,
  }),
}
