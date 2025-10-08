import { applicationConfig, Meta, moduleMetadata, StoryObj } from '@storybook/angular'

import { provideAnimations } from '@angular/platform-browser/animations'
import { provideRouter, RouterModule } from '@angular/router'
import { provideLocationMocks } from '@angular/common/testing'

import { provideStoryInitialUrl } from '@marklb/storybook-angular-initial-url'
import { routeButton, StoryEmptyComponent } from '@theseam/ui-common/story-helpers'

import { StoryUsersDataService } from './story-user-data.service'
import { StoryUserIdToNameResolver } from './story-userid-to-name.resolver'

import { TheSeamBreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

const meta: Meta<TheSeamBreadcrumbsComponent> = {
  title: 'Breadcrumbs/Components/Full',
  component: TheSeamBreadcrumbsComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        provideLocationMocks(),
      ],
    }),
    moduleMetadata({
      imports: [
        RouterModule,
      ],
    }),
  ],
}

export default meta
type Story = StoryObj<TheSeamBreadcrumbsComponent>

export const Example: Story = {
  render: () => ({
    applicationConfig: {
      providers: [
        provideRouter([
          {
            path: '',
            pathMatch: 'full',
            redirectTo: '/home',
          },
          {
            path: 'home',
            component: StoryEmptyComponent,
            data: {
              breadcrumb: 'Home',
            },
          },
          {
            path: 'dashboard',
            component: StoryEmptyComponent,
            data: {
              breadcrumb: 'Dashboard',
            },
            children: [
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
            ],
          },
        ]),
        provideStoryInitialUrl('/dashboard/users/123'),
        StoryUsersDataService,
        StoryUserIdToNameResolver,
      ],
    },
    props: {
      // btn1: routeButton(button, '/'),
      // btn2: routeButton(button, '/home'),
      // btn3: routeButton(button, '/dashboard'),
      // btn4: routeButton(button, '/dashboard/users'),
      // btn5: routeButton(button, '/dashboard/users/123'),
      // btn6: routeButton(button, '/dashboard/users/987'),
    },
    template: `
      <seam-breadcrumbs></seam-breadcrumbs>
      <router-outlet></router-outlet>
    `,
  }),
}
