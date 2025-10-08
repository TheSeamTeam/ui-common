import { Meta, StoryObj } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter, RouterModule } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'

import { initialUrlFromArgs } from '@marklb/storybook-angular-initial-url'
import { routesArgType, StoryEmptyComponent } from '@theseam/ui-common/story-helpers'

import { StoryUsersDataService } from './story-user-data.service'
import { StoryUserIdToNameResolver } from './story-userid-to-name.resolver'

import { TheSeamBreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

interface ExtraArgs {
  route: any
}

const meta: Meta<TheSeamBreadcrumbsComponent & ExtraArgs> = {
  title: 'Breadcrumbs/Components/Resolver',
  component: TheSeamBreadcrumbsComponent,
  decorators: [ ],
}

export default meta
type Story = StoryObj<TheSeamBreadcrumbsComponent & ExtraArgs>

export const Example: Story = {
  decorators: [
    initialUrlFromArgs({ argName: 'route' }),
  ],
  render: args => ({
    applicationConfig: {
      providers: [
        provideAnimations(),
        provideLocationMocks(),
        provideRouter([
          {
            path: 'users',
            component: StoryEmptyComponent,
            data: {
              breadcrumb: 'Users',
            },
            children: [
              {
                path: ':userId',
                component: StoryEmptyComponent,
                data: { },
                resolve: {
                  breadcrumb: StoryUserIdToNameResolver,
                },
              },
            ],
          },
        ]),
        StoryUsersDataService,
        StoryUserIdToNameResolver,
      ],
    },
    moduleMetadata: {
      imports: [
        RouterModule,
      ],
    },
    props: { ...args },
    template: `
      <seam-breadcrumbs></seam-breadcrumbs>
      <router-outlet></router-outlet>
    `,
  }),
  argTypes: {
    // TODO: Fix this type
    route: routesArgType([
      '/users',
      '/users/123',
      '/users/987',
      '/users/999',
    ]) as any,
  },
  args: {
    route: '/users/123',
  },
}
