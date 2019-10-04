import { select, text, withKnobs } from '@storybook/addon-knobs'
import { storiesOf } from '@storybook/angular'

import { Component, Injectable } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { ActivatedRouteSnapshot, RouterModule, RouterStateSnapshot } from '@angular/router'
import { Observable, of } from 'rxjs'
import { map, take } from 'rxjs/operators'

import { ITheSeamBreadcrumbsResolver } from './breadcrumbs-resolver'
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component'

@Component({
  template: `
    <seam-breadcrumbs></seam-breadcrumbs>
    <div class="d-flex flex-row flex-wrap">
      <button type="button" class="btn btn-primary mx-1" routerLink="/">'/'</button>
      <button type="button" class="btn btn-primary mx-1" routerLink="/home">'/home'</button>
      <button type="button" class="btn btn-primary mx-1" routerLink="/dashboard">'/dashboard'</button>
      <button type="button" class="btn btn-primary mx-1" routerLink="/dashboard/users">'/dashboard/users'</button>
      <button type="button" class="btn btn-primary mx-1" routerLink="/dashboard/users/123">'/dashboard/users/123'</button>
      <button type="button" class="btn btn-primary mx-1" routerLink="/dashboard/users/987">'/dashboard/users/987'</button>
    </div>
  `
})
class OutletComponent {}

@Injectable()
class UsersDataService {
  public users$ = of([
    { id: 123, name: 'user1' },
    { id: 987, name: 'user2' },
    { id: 456, name: 'user3' },
    { id: 654, name: 'user4' },
  ])
}

@Injectable()
class UserIdToNameResolver implements ITheSeamBreadcrumbsResolver {

  constructor(
    private _users: UsersDataService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<string> | Promise<string> | string {
    const UNKNOWN_USER = 'Unknown User'
    const userId = route.paramMap.get('userId')

    return userId !== null
      ? this._users.users$.pipe(
          map(users => users.find(u => u.id === +userId)),
          map(user => user ? user.name : UNKNOWN_USER),
          take(1)
        )
      : UNKNOWN_USER
  }
}


storiesOf('Breadcrumbs', module)
  .addDecorator(withKnobs)

  .add('Basic', () => ({
    moduleMetadata: {
      declarations: [
        BreadcrumbsComponent,
        OutletComponent
      ],
      providers: [
        UsersDataService,
        UserIdToNameResolver
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
            component: OutletComponent,
            data: {
              breadcrumb: 'Home'
            }
          },
          {
            path: 'dashboard',
            component: OutletComponent,
            data: {
              breadcrumb: 'Dashboard'
            },
            children: [
              {
                path: 'users',
                component: OutletComponent,
                data: {
                  breadcrumb: 'Users'
                },
                children: [
                  {
                    path: ':userId',
                    component: OutletComponent,
                    data: { },
                    resolve: {
                      breadcrumb: UserIdToNameResolver
                    }
                  }
                ]
              }
            ]
          }
        ], { useHash: true })
      ]
    },
    props: { },
    template: `
      <router-outlet></router-outlet>
    `
  }))
