import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { Observable } from 'rxjs'
import { map, take } from 'rxjs/operators'

import { StoryUsersDataService } from './story-user-data.service'

import { TheSeamBreadcrumbsResolver } from '../breadcrumbs-resolver'

@Injectable()
export class StoryUserIdToNameResolver implements TheSeamBreadcrumbsResolver {

  constructor(
    private _users: StoryUsersDataService
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<string> | Promise<string> | string {
    const UNKNOWN_USER = 'Unknown User'
    const userId = route.paramMap.get('userId')

    return userId !== null
      ? this._users.users$.pipe(
          // Find the user record
          map(users => users.find(u => u.id === +userId)),
          // Map the record to name
          map(user => user ? user.name : UNKNOWN_USER),
          // Ensure the observable completes
          take(1)
        )
      : UNKNOWN_USER
  }
}
