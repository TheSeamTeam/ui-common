import { Meta, StoryObj } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter, RouterModule } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'

import { provideStoryInitialUrl } from '@marklb/storybook-angular-initial-url'
import { routesArgType, StoryEmptyComponent } from '@theseam/ui-common/story-helpers'

import { StoryUsersDataService } from './story-user-data.service'
import { StoryUserIdToNameResolver } from './story-userid-to-name.resolver'

import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

interface ExtraArgs {
  route: any
}

const meta: Meta<BreadcrumbsComponent & ExtraArgs> = {
  title: 'Breadcrumbs/Components/Resolver',
  component: BreadcrumbsComponent,
  decorators: [ ]
}

export default meta
type Story = StoryObj<BreadcrumbsComponent & ExtraArgs>

export const Example: Story = {
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
        provideStoryInitialUrl('/users/123'),
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
      '/users/999'
    ]) as any,
  },
}
