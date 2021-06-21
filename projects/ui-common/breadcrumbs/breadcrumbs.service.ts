import { Injectable } from '@angular/core'
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { combineLatest, Observable, of } from 'rxjs'
import { filter, map, startWith, switchMap } from 'rxjs/operators'

import { activatedRoutesWithDataProperty, IActivatedRouteWithData, routeSnapshotPathFull } from '@theseam/ui-common/utils'

import { ITheSeamBreadcrumb } from './breadcrumb'

@Injectable({
  providedIn: 'root'
})
export class TheSeamBreadcrumbsService {

  public readonly breadcrumbDataKey = 'breadcrumb'

  public crumbs$: Observable<ITheSeamBreadcrumb[]>

  constructor(
    private _router: Router,
    private _activatedRoute: ActivatedRoute
  ) {
    this.crumbs$ = this._router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(_ => this._activatedRoute),
      startWith(this._activatedRoute),
      activatedRoutesWithDataProperty(this.breadcrumbDataKey, true),
      switchMap(rwdArr => combineLatest(rwdArr.map(rwd => this._parseBreadcrumbData(rwd))))
    )
  }

  private _parseBreadcrumbData(routeWithData: IActivatedRouteWithData): Observable<ITheSeamBreadcrumb> {
    const crumbValue = routeWithData.data[this.breadcrumbDataKey]
    const route = routeWithData.route
    const path = routeSnapshotPathFull(route.snapshot)
    let value = ''

    if (typeof crumbValue === 'string') {
      value = crumbValue
    } else {
      console.warn(
        '[TheSeamBreadcrumbsService] Only string breadcrumbs are supported currently. '
        + 'Use a resolver if the value needs to be dynamically calculated.'
      )
    }

    return of({ value, path, route })
  }

}
