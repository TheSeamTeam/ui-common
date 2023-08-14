// import { button, withKnobs } from '@storybook/addon-knobs'
import { Meta, Story } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { routeButton, StoryEmptyComponent, StoryInitialRouteModule } from '@theseam/ui-common/story-helpers'

import { StoryUsersDataService } from './story-user-data.service'
import { StoryUserIdToNameResolver } from './story-userid-to-name.resolver'

import { importProvidersFrom } from '@angular/core'
import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

export default {
  title: 'Breadcrumbs/Components/Full',
  component: BreadcrumbsComponent,
  decorators: [
    // withKnobs
  ]
} as Meta

export const Example: Story = () => ({
  applicationConfig: {
    providers: [
      provideAnimations(),
      importProvidersFrom(
        RouterModule.forRoot([
          {
            path: '',
            pathMatch: 'full',
            redirectTo: '/home',
          },
          {
            path: 'home',
            component: StoryEmptyComponent,
            data: {
              breadcrumb: 'Home'
            }
          },
          {
            path: 'dashboard',
            component: StoryEmptyComponent,
            data: {
              breadcrumb: 'Dashboard'
            },
            children: [
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
            ]
          }
        ], { useHash: true }),
        StoryInitialRouteModule.forRoot('/dashboard/users/123'),
      ),
      StoryUsersDataService,
      StoryUserIdToNameResolver
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
  `
})
