import { button, select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { APP_INITIALIZER, Component, Injectable, Injector } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Router, RouterModule } from '@angular/router'

import { StoryEmptyComponent, StoryInitialRouteModule } from '../../../stories/helpers/index'

import { StoryUsersDataService } from './story-user-data.service'
import { StoryUserIdToNameResolver } from './story-userid-to-name.resolver'

import { BreadcrumbsComponent } from '../breadcrumbs/breadcrumbs.component'

const groupId = 'GROUP-ID1'
const routeButton = (url: string) => button(url, () => {
  location.hash = `#${url}`
  return false
}, groupId)

storiesOf('Components|Breadcrumbs', module)
  .addDecorator(withKnobs)

  .add('Full Example', () => ({
    moduleMetadata: {
      declarations: [
        BreadcrumbsComponent,
        StoryEmptyComponent
      ],
      providers: [
        StoryUsersDataService,
        StoryUserIdToNameResolver,
        // {
        //   provide: APP_INITIALIZER,
        //   useFactory: storyInitialRoute('/home'),
        //   // deps: [ Router ],
        //   // deps: [ Injector ],
        //   multi: true
        // }
      ],
      imports: [
        BrowserAnimationsModule,
        BrowserModule,
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
        StoryInitialRouteModule.forRoot('/dashboard/users')
      ]
    },
    props: {
      btn1: routeButton('/'),
      btn2: routeButton('/home'),
      btn3: routeButton('/dashboard')
    },
    template: `
      <seam-breadcrumbs></seam-breadcrumbs>

      <div class="d-flex flex-row flex-wrap">
        <button type="button" class="btn btn-primary mx-1 mb-1" routerLink="/">'/'</button>
        <button type="button" class="btn btn-primary mx-1 mb-1" routerLink="/home">'/home'</button>
        <button type="button" class="btn btn-primary mx-1 mb-1" routerLink="/dashboard">'/dashboard'</button>
        <button type="button" class="btn btn-primary mx-1 mb-1" routerLink="/dashboard/users">'/dashboard/users'</button>
        <button type="button" class="btn btn-primary mx-1 mb-1" routerLink="/dashboard/users/123">'/dashboard/users/123'</button>
        <button type="button" class="btn btn-primary mx-1 mb-1" routerLink="/dashboard/users/987">'/dashboard/users/987'</button>
        <a class="btn btn-primary mx-1 mb-1" routerLink="/dashboard/users/987">'/dashboard/users/987'</a>
      </div>
      <router-outlet></router-outlet>
    `
  }))
