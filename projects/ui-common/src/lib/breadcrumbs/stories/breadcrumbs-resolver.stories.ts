import { withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { RouterModule } from '@angular/router'

import { routeButton, StoryEmptyComponent, StoryInitialRouteModule } from '../../../stories/helpers/index'

import { StoryUsersDataService } from './story-user-data.service'
import { StoryUserIdToNameResolver } from './story-userid-to-name.resolver'

import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

storiesOf('Components|Breadcrumbs', module)
  .addDecorator(withKnobs)

  .add('Resolver', () => ({
    moduleMetadata: {
      declarations: [
        BreadcrumbsComponent,
        StoryEmptyComponent
      ],
      providers: [
        StoryUsersDataService,
        StoryUserIdToNameResolver
      ],
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
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
        StoryInitialRouteModule.forRoot('/users/123')
      ]
    },
    props: {
      btn1: routeButton('/users'),
      btn2: routeButton('/users/123'),
      btn3: routeButton('/users/987'),
      btn4: routeButton('/users/999'),
    },
    template: `
      <seam-breadcrumbs></seam-breadcrumbs>
      <router-outlet></router-outlet>
    `
  }))
