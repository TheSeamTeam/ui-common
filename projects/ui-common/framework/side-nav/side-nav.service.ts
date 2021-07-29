import { Injectable } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { combineLatest, Observable, of } from 'rxjs'
import { filter, map, startWith, switchMap } from 'rxjs/operators'

import { activatedRoutesWithDataProperty, IActivatedRouteWithData, routeSnapshotPathFull } from '@theseam/ui-common/utils'

import { ISideNavItem, SideNavItemWithState } from './side-nav.models'

@Injectable({ providedIn: 'root' })
export class TheSeamSideNavService {

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute
  ) {

  }

  public getItemsState(items: ISideNavItem[]): SideNavItemWithState[] {
    return []
  }

}
