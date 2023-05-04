import { Meta, Story } from '@storybook/angular'

import { importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { routesArgType, StoryEmptyComponent, StoryInitialRouteModule } from '@theseam/ui-common/story-helpers'

import { StoryUsersDataService } from './story-user-data.service'
import { StoryUserIdToNameResolver } from './story-userid-to-name.resolver'

import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

export default {
  title: 'Breadcrumbs/Components/Resolver',
  component: BreadcrumbsComponent,
  decorators: [ ]
} as Meta

export const Example: Story = args => ({
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
    ]
  },
  props: { ...args },
  template: `
    <seam-breadcrumbs></seam-breadcrumbs>
    <router-outlet></router-outlet>
  `
})
Example.argTypes = {
  route: routesArgType([
    '/users',
    '/users/123',
    '/users/987',
    '/users/999'
  ])
}
