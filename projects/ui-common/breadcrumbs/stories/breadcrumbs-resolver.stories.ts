import { Meta, StoryObj } from '@storybook/angular'

import { importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { routesArgType, StoryEmptyComponent, StoryInitialRouteModule } from '@theseam/ui-common/story-helpers'

import { StoryUsersDataService } from './story-user-data.service'
import { StoryUserIdToNameResolver } from './story-userid-to-name.resolver'

import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

const meta: Meta<BreadcrumbsComponent> = {
  title: 'Breadcrumbs/Components/Resolver',
  component: BreadcrumbsComponent,
  decorators: [ ]
}

export default meta
type Story = StoryObj<BreadcrumbsComponent>

export const Example: Story = {
  render: args => ({
    applicationConfig: {
      providers: [
        provideAnimations(),
        importProvidersFrom(
          RouterModule.forRoot([
            {
              path: 'users',
              component: StoryEmptyComponent,
              data: {
                breadcrumb: 'Users'
              },
              children: [
                {
                  path: ':userId',
                  component: StoryEmptyComponent,
                  data: { },
                  resolve: {
                    breadcrumb: StoryUserIdToNameResolver
                  }
                }
              ]
            }
          ], { useHash: true }),
          StoryInitialRouteModule.forRoot('/users/123'),
        ),
        StoryUsersDataService,
        StoryUserIdToNameResolver,
      ],
    },
    moduleMetadata: {
      declarations: [
        StoryEmptyComponent
      ],
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
    route: routesArgType([
      '/users',
      '/users/123',
      '/users/987',
      '/users/999'
    ]),
  },
}
